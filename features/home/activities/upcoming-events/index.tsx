"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getUpcomingEvents } from "@/services/events";
import EmptyData from "@/components/app/empty-data";
import EventCard from "./event-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Render from "@/components/app/render";
import ErrorBoundary from "@/components/app/error-boundary";
import AppTooltip from "@/components/app/app-tooltip";
import { CalendarPlus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useAppSelector from "@/store/hooks";
import AppButton from "@/components/app/app-button";
import useActions from "@/store/actions";
import { cn } from "@/lib/utils";

export default function UpcomingEvents() {
	const { managerProfile: manager_profile } = useAppSelector("manager_profile");
	const { ui } = useActions();
	const {
		data: userEvents,
		isLoading: userLoading,
		error: userError,
		isError: userIsError,
	} = useQuery({
		queryKey: ["upcoming-events", manager_profile?.id],
		queryFn: () => getUpcomingEvents({ managerId: manager_profile?.id }),
	});

	const createEvent = () => {
		ui.changeDialog({
			show: true,
			type: "create_event",
		});
	};

	const { data: otherEvents, isLoading: otherLoading } = useQuery({
		queryKey: ["other-upcoming-events"],
		queryFn: () => getUpcomingEvents({}),
	});

	const isLoading = userLoading || otherLoading;
	const error = userError;
	const isError = userIsError;

	return (
		<ErrorBoundary>
			<Card className={cn("flex flex-col", {
				"min-h-96": !userEvents?.length && !otherEvents?.length,
			})}>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<CardTitle className="flex items-center gap-2 text-primary-500">
						Upcoming Events{" "}
						{userEvents && userEvents.length > 0 && (
							<Badge className="text-sm bg-accent-500 text-white rounded-full p-0 size-5 flex items-center justify-center">
								{userEvents?.length}
							</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 overflow-hidden">
					<Render
						isLoading={isLoading}
						isError={isError}
						error={error}
						loadingComponent={<LoadingComponent />}
					>
						<div className="space-y-4">
							{/* User's Events */}
							{userEvents && userEvents.length > 0 ? (
								<div className="space-y-3 max-h-96 overflow-auto hide-scrollbar">
									{userEvents.slice(0).map((event) => (
										<EventCard key={event.id} event={event} scope="user" />
									))}
								</div>
							) : (
								<EmptyData
									// title="No Upcoming Events"
									text="You don't have any upcoming events scheduled yet."
									className="!justify-start py-8 "
									iconType="event"
									action={
										<AppButton
											variant="black"
											onClick={createEvent}
											leftIcon={<CalendarPlus className="w-4 h-4" />}
										>
											Create Event
										</AppButton>
									}
								/>
							)}

							{/* Other Managers' Events */}

							{otherEvents && otherEvents.length > 0 && (
								<Collapsible className="space-y-3">
									<CollapsibleTrigger asChild>
										<div className=" cursor-pointer flex items-center justify-between pt-3 border-t border-neutral-200">
											<h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-1">
												Other Upcoming Events{" "}
												<AppTooltip trigger={<Info className="w-4 h-4 text-accent-500" />}>
													<p>This are other upcoming events on the platform.</p>
												</AppTooltip>
											</h3>
											<span className="text-xs text-neutral-500">
												{otherEvents?.length ?? 0} events
											</span>
										</div>
									</CollapsibleTrigger>
									<CollapsibleContent className="max-h-96 overflow-auto hide-scrollbar">
										{!otherEvents || otherEvents.length === 0 ? (
											<EmptyData
												text="No events found."
												className="!justify-start py-8"
												iconType="event"
											/>
										) : (
											otherEvents?.map((event) => (
												<EventCard key={event.id} event={event} scope="other" />
											))
										)}
									</CollapsibleContent>
								</Collapsible>
							)}
						</div>
					</Render>
				</CardContent>
			</Card>
		</ErrorBoundary>
	);
}

function LoadingComponent() {
	return (
		<div className="space-y-3 w-full">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex gap-3">
					<Skeleton className="h-24 w-28 rounded-md flex-shrink-0" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				</div>
			))}
		</div>
	);
}
