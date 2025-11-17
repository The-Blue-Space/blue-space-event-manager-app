"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getActiveEvents } from "@/services/events";
import EventDetailsView from "./event-details";
import EmptyData from "@/components/app/empty-data";
import ActivitiesView from "./event-activities";
import Render from "@/components/app/render";
import ErrorBoundary from "@/components/app/error-boundary";
import { cn } from "@/lib/utils";

export default function ActiveEvents() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [viewMode, setViewMode] = useState<"details" | "activities">("details");

	const { data: events, isLoading: eventsLoading } = useQuery({
		queryKey: ["active-events"],
		queryFn: () => getActiveEvents(),
	});

	const currentEvent = events?.[currentIndex];

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	const handleNext = () => {
		if (events && currentIndex < events.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	return (
		<ErrorBoundary>
			<Card className={cn("h-fit flex flex-col bg", {
				"min-h-96": !events?.length,
			})}>
				<Render isLoading={eventsLoading} loadingComponent={<LoadingComponent />}>
					<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
						{events && events.length > 1 && (
							<Button
								variant="outline"
								size="icon"
								onClick={handlePrevious}
								disabled={currentIndex === 0}
								className="h-8 w-8"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
						)}
						<CardTitle className="text-lg text-primary-500 flex flex-col items-center justify-center">
							Active Events
							{events && events.length > 1 && (
								<p className="text-xs text-neutral-600 min-w-[50px] text-center">
									{currentIndex + 1} / {events.length}
								</p>
							)}
						</CardTitle>
						{events && events.length > 1 && (
							<Button
								variant="outline"
								size="icon"
								onClick={handleNext}
								disabled={currentIndex === (events?.length ?? 0) - 1}
								className="h-8 w-8"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						)}
					</CardHeader>

					{events && events.length > 0 ? (
						<CardContent className="flex-1 overflow-hidden">
							<Tabs
								value={viewMode}
								onValueChange={(v) => setViewMode(v as "details" | "activities")}
								className="h-full flex flex-col"
							>
								<TabsList className="grid w-full grid-cols-2 mb-4">
									<TabsTrigger value="details">Event Details</TabsTrigger>
									<TabsTrigger value="activities">Activities</TabsTrigger>
								</TabsList>

								{currentEvent && (
									<>
										<TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
											<EventDetailsView event={currentEvent} />
										</TabsContent>

										<TabsContent
											value="activities"
											className="flex-1 overflow-y-auto mt-0 min-h-96"
										>
											<ActivitiesView eventId={currentEvent.id} />
										</TabsContent>
									</>
								)}
							</Tabs>
						</CardContent>
					) : (
						<EmptyComponent />
					)}
				</Render>
			</Card>
		</ErrorBoundary>
	);
}

export function EmptyComponent() {
	return (
		<Card className="h-full !border-none shadow-none">
			<CardHeader>{/* <CardTitle>Active Events</CardTitle> */}</CardHeader>
			<CardContent>
				<EmptyData
					iconType="event"
					title="No Active Events"
					text="There are no active events at the moment."
					className="!justify-start py-8 border-none"
				/>
			</CardContent>
		</Card>
	);
}

export function LoadingComponent() {
	return (
		<Card className="h-full w-full">
			<CardHeader className="flex flex-row items-center justify-between">
				<Skeleton className="h-6 w-32" />
				<div className="flex gap-2">
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
				</div>
			</CardHeader>
			<CardContent>
				<Skeleton className="h-64 w-full rounded-lg mb-4" />
				<Skeleton className="h-4 w-3/4 mb-2" />
				<Skeleton className="h-4 w-1/2" />
			</CardContent>
		</Card>
	);
}
