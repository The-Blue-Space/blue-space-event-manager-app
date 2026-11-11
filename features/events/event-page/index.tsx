"use client";
import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlbumTab from "@/features/events/album";
import GuestsTab from "@/features/events/guests";
import { EventProvider, useEvent } from "@/features/events/manage-event/context";
import AgendaTab from "@/features/events/agenda";
import BasicInfo from "@/features/events/manage-event/tabs/basic-info";
import MediaTab from "@/features/events/media";
import TicketsTab from "@/features/events/manage-event/tabs/tickets";
import { DashboardError } from "@/features/home/dashboard/states";
import useCustomNavigation from "@/hooks/use-navigation";
import ensureError from "@/lib/ensure-error";
import getEventSummary from "@/services/events/get-event-summary";
import publishEvent from "@/services/events/publish-event";
import useActions from "@/store/actions";
import EventHeader from "./header";
import Overview from "./overview";
import { EventTab } from "./steps";
import { UnsavedChanges, UnsavedChangesProvider } from "./unsaved-changes";
import VendorsComingSoon from "./vendors-coming-soon";

// `value` is what the reused setup tabs register with; `id` is what the URL shows.
const TABS: { id: EventTab; value: string; label: string; soon?: boolean }[] = [
	{ id: "overview", value: "overview", label: "Overview" },
	{ id: "details", value: "basic-information", label: "Details" },
	{ id: "tickets", value: "ticket", label: "Tickets" },
	{ id: "media", value: "medias", label: "Media" },
	{ id: "agenda", value: "agenda", label: "Agenda" },
	{ id: "vendors", value: "vendor", label: "Vendors", soon: true },
	{ id: "guests", value: "guests", label: "Guests" },
	{ id: "album", value: "album", label: "Album" },
];

const resolveTab = (param: string | null) => TABS.find((tab) => tab.id === param || tab.value === param) ?? TABS[0];

function EventWorkspace() {
	const { params, queryParams, navigate } = useCustomNavigation();
	const eventId = params.event_id as string;
	const tab = resolveTab(queryParams.get("tab"));
	const { event } = useEvent();
	const { ui } = useActions();
	const queryClient = useQueryClient();

	const summary = useQuery({ queryKey: ["event-summary", eventId], queryFn: () => getEventSummary(eventId) });

	// The setup tabs save through their own services, so refresh the summary whenever the event changes
	// or the organizer comes back to Overview, to keep the checklist and header in step.
	const { refetch: refetchSummary } = summary;
	React.useEffect(() => {
		if (tab.id === "overview") refetchSummary();
	}, [tab.id, event?.updated_at, refetchSummary]);

	const refresh = () => {
		for (const key of [["event-summary", eventId], ["event-details", eventId], ["events"], ["manager-events"], ["home-dashboard"]]) {
			queryClient.invalidateQueries({ queryKey: key });
		}
	};
	const publish = useMutation({
		mutationFn: () => publishEvent({ event_id: eventId }),
		onSuccess: () => {
			toast.success("Published. Guests can find it now.");
			refresh();
		},
		onError: (error) => toast.error(ensureError(error).message),
	});

	// Details reports whether anything on it can't be saved. A draft's Details saves itself, so leaving only asks
	// when something needs a fix; a published event's Details asks if you haven't pressed Save.
	const unsaved = React.useRef<UnsavedChanges | null>(null);
	/** Publishing waits for pending saves, so guests never get the version from before your last edit. */
	const settled = async () => !unsaved.current || (await unsaved.current.flush());

	// Switching tabs doesn't wait for a save: closing Details saves what's pending, and the device keeps a copy.
	const goTo = (id: EventTab) => {
		if (tab.id === "details" && id !== "details" && unsaved.current?.unsafeToLeave) {
			ui.changeDialog({
				show: true,
				type: "info_dialog",
				data: {
					title: "Leave without saving?",
					text: "Some changes on Details aren’t saved. They’re kept on this device, so you can restore them when you come back.",
				},
				action: () => navigate(`?tab=${id}`),
			});
			return;
		}
		navigate(`?tab=${id}`);
	};

	const publishNow = async () => {
		if (!(await settled())) {
			ui.changeDialog({
				show: true,
				type: "info_dialog",
				data: {
					title: "Publish without your latest changes?",
					text: "Some changes on Details aren’t saved, so guests won’t see them. Fix them first, or publish without them.",
				},
				action: () => publish.mutate(),
			});
			return;
		}
		publish.mutate();
	};

	return (
		<div className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-5 px-4 pb-16 pt-6 sm:px-8 lg:px-10">
			<nav aria-label="Breadcrumb" className="text-[13px] text-auth-muted">
				<Link href="/events" className="hover:text-auth-ink">
					Events
				</Link>
				<span aria-hidden="true"> / </span>
				<span className="font-semibold text-auth-ink">{summary.data?.event.title ?? event?.title ?? "Event"}</span>
			</nav>

			{summary.data ? (
				<EventHeader
					summary={summary.data}
					isBusy={publish.isPending}
					onPublish={publishNow}
				/>
			) : summary.isError ? (
				<DashboardError onRetry={() => summary.refetch()} isRetrying={summary.isFetching} />
			) : (
				<div className="flex items-center gap-5">
					<Skeleton className="size-[72px] rounded-[14px]" />
					<div className="grid flex-1 gap-2">
						<Skeleton className="h-6 w-72 max-w-full" />
						<Skeleton className="h-4 w-56 max-w-full" />
					</div>
				</div>
			)}

			<UnsavedChangesProvider value={unsaved}>
				<Tabs value={tab.value} onValueChange={(value) => goTo(resolveTab(value).id)}>
					<TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-auth-line bg-transparent p-0">
						{TABS.map((item) => (
							<TabsTrigger
								key={item.id}
								value={item.value}
								className="-mb-px h-auto rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2.5 pt-2 text-[14px] font-semibold text-auth-muted shadow-none data-[state=active]:border-primary-500 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-auth-ink data-[state=active]:shadow-none"
							>
								{item.label}
								{item.soon && (
									<span className="ml-1.5 inline-flex h-[18px] items-center rounded-full bg-auth-info-soft px-1.5 text-[11px] font-bold text-primary-500">
										Soon
									</span>
								)}
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value="overview" className="mt-5">
						{summary.data && <Overview summary={summary.data} onNavigate={goTo} />}
					</TabsContent>

					{event ? (
						<>
							<BasicInfo />
							<TicketsTab eventId={eventId} onNavigate={goTo} />
							<TabsContent value="medias" className="mt-5 min-w-0">
								{tab.id === "media" && <MediaTab eventId={eventId} />}
							</TabsContent>
							<TabsContent value="agenda" className="mt-5 min-w-0">
								{tab.id === "agenda" && <AgendaTab eventId={eventId} />}
							</TabsContent>
							<TabsContent value="vendor" className="mt-5">
								<VendorsComingSoon />
							</TabsContent>
							<TabsContent value="guests" className="mt-5 min-w-0">
								{tab.id === "guests" && <GuestsTab eventId={eventId} />}
							</TabsContent>
							<TabsContent value="album" className="mt-5">
								{tab.id === "album" && <AlbumTab eventId={eventId} />}
							</TabsContent>
						</>
					) : (
						tab.id !== "overview" && <Skeleton className="mt-5 h-64 w-full rounded-[14px]" />
					)}
				</Tabs>
			</UnsavedChangesProvider>
		</div>
	);
}

export default function EventPage() {
	return (
		<EventProvider>
			<EventWorkspace />
		</EventProvider>
	);
}
