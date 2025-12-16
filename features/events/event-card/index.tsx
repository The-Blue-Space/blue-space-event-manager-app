import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import useCustomNavigation from "@/hooks/use-navigation";
import { Event } from "@/types/event.types";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import EventActions from "./event-actions";
import EventMetrics from "./event-metrics";

type EventCardProps = {
	event: Event;
};

export default React.memo(function EventCard({ event }: EventCardProps) {
	const { navigate } = useCustomNavigation();
	

	const coverImage = event.event_media?.find((media) => media.media_type === "cover")?.url;
	const eventDate = event.event_start_date ? new Date(event.event_start_date) : null;

	
	

	const handleCardClick = () => {
		navigate(`/events/${event.id}`);
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (time?: string | null) => {
		if (!time) return "";
		const [hours, minutes] = time.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	return (
		<Card
			className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group relative"
			onClick={handleCardClick}
		>
			{/* Event Actions */}
			<EventActions eventId={event.id} eventTitle={event.title} />

			<CardContent className="p-0">
				{/* Event Image */}
				<div className="relative w-full aspect-video bg-neutral-200">
					{coverImage ? (
						<Image
							src={coverImage}
							alt={event.title}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-300"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-neutral-400">
							<Calendar className="w-12 h-12" />
						</div>
					)}
					{/* Published Badge */}
					<div className="absolute top-3 left-3">
						<Badge
							variant={event.published ? "default" : "secondary"}
							className={
								event.published
									? "bg-green-500 hover:bg-green-600 text-white"
									: "bg-orange-500 hover:bg-orange-600 text-white"
							}
						>
							{event.published ? "Published" : "Unpublished"}
						</Badge>
					</div>
				</div>

				{/* Event Details */}
				<div className="p-4 space-y-3">
					{/* Title */}
					<h3 className="font-bold text-lg text-primary-500 line-clamp-2 group-hover:text-primary-600 transition-colors">
						{event.title}
					</h3>

					{/* Location */}
					<div className="flex items-center gap-2 text-sm text-neutral-600">
						<MapPin className="w-4 h-4 flex-shrink-0" />
						<span className="line-clamp-1">{`${event.city}, ${event.address}`}</span>
					</div>

					{/* Date & Time */}
					{eventDate && (
						<div className="flex items-center gap-2 text-sm text-neutral-600">
							<Calendar className="w-4 h-4 flex-shrink-0" />
							<span>
								{formatDate(eventDate)}
								{event.event_start_time && ` • ${formatTime(event.event_start_time)}`}
							</span>
						</div>
					)}

					{/* Access Type & Category */}
					<div className="flex items-center gap-2 flex-wrap">
						<Badge variant="outline" className="capitalize">
							{event.access_type.replace("-", " ")}
						</Badge>
						{event.event_category && (
							<Badge variant="secondary" className="border border-neutral-200">
								{event.event_category.name}
							</Badge>
						)}
					</div>

					{/* Metrics */}
					<EventMetrics event={event} />
				</div>
			</CardContent>
		</Card>
	);
});
