"use client";

import { useQuery } from "@tanstack/react-query";
import getEventDetails from "@/services/events/get-event-details";
import getEventMetrics from "@/services/events/get-event-metrics";
import MetricsCards from "./metrics-cards";
import EventDetailsTab from "./event-details-tab";
import TicketsTab from "./tickets-tab";
import ActivitiesTab from "./activities-tab";
import AlbumManager from "./album-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppButton from "@/components/app/app-button";
import { Images } from "lucide-react";
import Render from "@/components/app/render";
import { Skeleton } from "@/components/ui/skeleton";
import useCustomNavigation from "@/hooks/use-navigation";
import AppContainer from "@/components/app/container/container";
import Link from "next/link";
import Maximum from "@/components/app/container/maximum";
import Minimum from "@/components/app/container/minimum";

export default function EventDetails() {
	const { queryParams, params } = useCustomNavigation();
	const albumTab = queryParams.has("tab", "album");

	const eventId = params.event_id as string;
	// Fetch event details
	const {
		data: event,
		isLoading: eventLoading,
		error: eventError,
	} = useQuery({
		queryKey: ["event-details", eventId],
		queryFn: () => getEventDetails({ id: eventId }),
		enabled: !!eventId,
	});

	// Fetch event metrics
	const { data: metrics, isLoading: metricsLoading } = useQuery({
		queryKey: ["event-metrics", eventId],
		queryFn: () => getEventMetrics({ eventId }),
		enabled: !!eventId,
	});

	const handleOpenAlbum = () => {
		queryParams.set("tab", "album");
	};

	return (
		<AppContainer className="w-full">
			<Render
				isLoading={eventLoading}
				error={eventError}
				isError={!!eventError}
				loadingComponent={LoadingComponent}
			>
				{event && (
					<div className="space-y-6">
						{/* Header */}
						<div className="flex items-center justify-between">
							<div>
								<h1 className="body-1 font-bold text-neutral-900">{event.title}</h1>
								<p className="text-neutral-600 mt-1">Event Details & Management</p>
							</div>
							<Link href={`/events/${event.id}/manage`} className="button-primary">
								Manage Event
							</Link>
						</div>

						{/* Metrics Cards */}
						<MetricsCards metrics={metrics} isLoading={metricsLoading} />

						{/* Tabs */}
						<div className="flex flex-col lg:flex-row gap-5">
							<Maximum>
								<Tabs defaultValue="details" className="w-full">
									<div className="flex items-center justify-between">
										<TabsList>
											<TabsTrigger value="details">Event Details</TabsTrigger>
											<TabsTrigger value="tickets">Tickets</TabsTrigger>
										</TabsList>
										<div className="flex items-center gap-2">
											<AppButton
												variant="outline"
												onClick={handleOpenAlbum}
												leftIcon={<Images className="w-4 h-4" />}
											>
												Manage Album
											</AppButton>
										</div>
									</div>

									<TabsContent value="details" className="mt-6">
										<EventDetailsTab event={event} />
									</TabsContent>

									<TabsContent value="tickets" className="mt-6">
										<TicketsTab event={event} />
									</TabsContent>

									<TabsContent value="activities" className="mt-6"></TabsContent>
								</Tabs>
							</Maximum>
							<Minimum>
								<ActivitiesTab eventId={eventId} />
							</Minimum>
						</div>
						{/* Album Manager Drawer */}
					</div>
				)}
				<AlbumManager eventId={eventId} open={albumTab} />
			</Render>
		</AppContainer>
	);
}

function LoadingComponent() {
	return (
		<div className="space-y-6 p-6">
			<Skeleton className="h-8 w-64" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} className="h-32" />
				))}
			</div>
			<Skeleton className="h-96" />
		</div>
	);
}
