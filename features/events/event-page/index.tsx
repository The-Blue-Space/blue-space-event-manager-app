"use client";
import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlbumManager from "@/features/events/event-details/album-manager";
import InviteDialog from "@/features/events/event-details/invite-dialog";
import ParticipantsTab from "@/features/events/event-details/participants-tab";
import TicketsTab from "@/features/events/event-details/tickets-tab";
import VendorApplicationsTab from "@/features/events/event-details/vendor-applications-tab";
import { EventProvider, useEvent } from "@/features/events/manage-event/context";
import Agenda from "@/features/events/manage-event/tabs/agenda";
import BasicInfo from "@/features/events/manage-event/tabs/basic-info";
import Media from "@/features/events/manage-event/tabs/media";
import Ticket from "@/features/events/manage-event/tabs/ticket";
import VendorTab from "@/features/events/manage-event/tabs/vendor";
import { DashboardError } from "@/features/home/dashboard/states";
import useCustomNavigation from "@/hooks/use-navigation";
import ensureError from "@/lib/ensure-error";
import getEventSummary from "@/services/events/get-event-summary";
import publishEvent from "@/services/events/publish-event";
import unpublishEvent from "@/services/events/unpublish-event";
import useActions from "@/store/actions";
import EventHeader from "./header";
import Overview from "./overview";
import { EventTab } from "./steps";
import { UnsavedChangesProvider } from "./unsaved-changes";

// `value` is what the reused setup tabs register with; `id` is what the URL shows.
const TABS: { id: EventTab; value: string; label: string }[] = [
	{ id: "overview", value: "overview", label: "Overview" },
	{ id: "details", value: "basic-information", label: "Details" },
	{ id: "tickets", value: "ticket", label: "Tickets" },
	{ id: "media", value: "medias", label: "Media" },
	{ id: "agenda", value: "agenda", label: "Agenda" },
	{ id: "vendors", value: "vendor", label: "Vendors" },
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
	const [inviteOpen, setInviteOpen] = React.useState(false);

	const summary = useQuery({ queryKey: ["event-summary", eventId], queryFn: () => getEventSummary(eventId) });

	// The setup tabs save through their own services, so refresh the summary whenever the event changes
	// or the organizer comes back to Overview, to keep the checklist and header in step.
	const { refetch: refetchSummary } = summary;
	React.useEffect(() => {
		if (tab.id === "overview") refetchSummary();
	}, [tab.id, event?.updated_at, refetchSummary]);

	const refresh = () => {
		for (const key of [["event-summary", eventId], ["event-details", eventId], ["events"], ["home-dashboard"]]) {
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
	const unpublish = useMutation({
		mutationFn: () => unpublishEvent({ event_id: eventId }),
		onSuccess: () => {
			toast.success("Unpublished. It’s a draft again.");
			refresh();
		},
		onError: (error) => toast.error(ensureError(error).message),
	});

	// Details saves with one button, so leaving it with unsaved edits asks first.
	const unsaved = React.useRef(false);
	const goTo = (id: EventTab) => {
		if (unsaved.current && tab.id === "details" && id !== "details") {
			ui.changeDialog({
				show: true,
				type: "info_dialog",
				data: {
					title: "Discard changes?",
					text: "Your changes on Details haven’t been saved. If you leave this tab, they’ll be lost.",
				},
				action: () => {
					unsaved.current = false;
					navigate(`?tab=${id}`);
				},
			});
			return;
		}
		navigate(`?tab=${id}`);
	};
	const confirmUnpublish = () =>
		ui.changeDialog({
			show: true,
			type: "info_dialog",
			data: {
				title: "Unpublish this event?",
				text: "Guests won’t be able to find it or buy tickets until you publish it again.",
			},
			action: () => unpublish.mutate(),
		});

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
					isBusy={publish.isPending || unpublish.isPending}
					onPublish={() => publish.mutate()}
					onUnpublish={confirmUnpublish}
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
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value="overview" className="mt-5">
						{summary.data && <Overview summary={summary.data} onNavigate={goTo} />}
					</TabsContent>

					{event ? (
						<>
							<BasicInfo />
							<Ticket />
							<TabsContent value="ticket" className="mx-auto w-full p-5 xl:max-w-3xl">
								<TicketsTab event={event} />
							</TabsContent>
							<Media />
							<Agenda />
							<VendorTab />
							<TabsContent value="vendor" className="mx-auto w-full p-5 xl:max-w-3xl">
								<VendorApplicationsTab eventId={eventId} />
							</TabsContent>
							<TabsContent value="guests" className="mt-5 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
								<div className="flex justify-end">
									<button
										type="button"
										onClick={() => setInviteOpen(true)}
										className="inline-flex h-10 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
									>
										<UserPlus aria-hidden="true" className="size-4" />
										Invite guests
									</button>
								</div>
								<div className="min-w-0 overflow-x-auto">
									<ParticipantsTab eventId={eventId} />
								</div>
							</TabsContent>
							<TabsContent value="album" className="mt-5">
								<AlbumManager eventId={eventId} open={tab.id === "album"} />
							</TabsContent>
						</>
					) : (
						tab.id !== "overview" && <Skeleton className="mt-5 h-64 w-full rounded-[14px]" />
					)}
				</Tabs>
			</UnsavedChangesProvider>

			<InviteDialog open={inviteOpen} onClose={setInviteOpen} eventId={eventId} />
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
