import { Badge } from "@/components/ui/badge";
import useCustomNavigation from "@/hooks/use-navigation";
import { Event } from "@/types/event.types";
import {
	Calendar,
	MapPin,
	Users,
	Ticket,
	DollarSign,
	Image as ImageIcon,
	RefreshCw,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import EventActions from "../../event-card/event-actions";
import { cn } from "@/lib/utils";

type EventListItemHybridCProps = {
	event: Event;
};

/**
 * Hybrid C: Vertical Date Strip
 * Date as a colored vertical strip on the left edge (modern, always visible)
 */
export default React.memo(function EventListItemHybridC({ event }: EventListItemHybridCProps) {
	const { navigate } = useCustomNavigation();

	const coverImage = event.event_media?.find((media) => media.media_type === "cover")?.url;
	const eventDate = event.event_start_date ? new Date(event.event_start_date) : null;

	const formatDate = (date: Date) => {
		return {
			day: date.getDate(),
			month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase().slice(0, 3),
		};
	};

	const formatTime = (time?: string | null) => {
		if (!time) return "";
		const [hours, minutes] = time.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const isTicketBased = event.access_type === "ticket-based";
	const dateInfo = eventDate ? formatDate(eventDate) : null;

	// Color based on published status
	const stripColor = event.published ? "bg-primary-500" : "bg-orange-400";

	const handleTitleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigate(`/events/${event.id}`);
	};

	return (
		<div className="relative border border-neutral-200 rounded-lg hover:border-neutral-300 hover:shadow-md transition-all bg-white overflow-hidden group">
			{/* Vertical Date Strip */}
			<div
				className={`absolute left-0 top-0 bottom-0 w-14 ${stripColor} flex flex-col items-center justify-center text-white`}
			>
				{dateInfo ? (
					<>
						<div className="text-2xl font-bold leading-none">{dateInfo.day}</div>
						<div className="text-xs font-medium mt-1 opacity-90">{dateInfo.month}</div>
					</>
				) : (
					<Calendar className="w-6 h-6" />
				)}
			</div>

			

			{/* Main Content */}
			<div className="flex items-start gap-3 p-3 pl-16">
				{/* Thumbnail */}
				<div className="relative w-20 h-20 flex-shrink-0 bg-neutral-200 rounded-lg overflow-hidden">
					{coverImage ? (
						<Image src={coverImage} alt={event.title} fill className="object-cover" />
					) : (
						<div className="w-full h-full flex items-center justify-center text-neutral-400">
							<Calendar className="w-8 h-8" />
						</div>
					)}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0 space-y-2">
					{/* Title Row */}
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h3
								onClick={handleTitleClick}
								className="font-bold text-base text-neutral-900 line-clamp-1 cursor-pointer hover:text-primary-600 transition-colors"
							>
								{event.title}
							</h3>
							<div className="flex items-center gap-2 mt-0.5 flex-wrap">
								{event.event_category && (
									<Badge
										variant="secondary"
										className="border border-neutral-200"
									>
										{event.event_category.name}
									</Badge>
								)}
								<Badge variant="outline" className="capitalize text-xs h-5">
									{event.access_type.replace("-", " ")}
								</Badge>
							</div>
						</div>
						<Badge
							variant={event.published ? "default" : "secondary"}
							className={cn({
								"bg-green-500 hover:bg-green-600 text-white flex-shrink-0": event.published,
								"bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0": !event.published,
							})}
						>
							{event.published ? "Published" : "Unpublished"}
						</Badge>
					</div>

					{/* Meta Info */}
					<div className="flex items-center gap-3 text-xs text-neutral-600 flex-wrap">
						<div className="flex items-center gap-1">
							<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
							<span className="line-clamp-1">{`${event.city}, ${event.address}`}</span>
						</div>
						{event.event_start_time && (
							<>
								<span className="text-neutral-300">•</span>
								<div className="flex items-center gap-1">
									<Calendar className="w-3.5 h-3.5 flex-shrink-0" />
									<span>{formatTime(event.event_start_time)}</span>
								</div>
							</>
						)}
					</div>

					{/* Metrics */}
					<div className="flex justify-between item-center flex-wrap pt-1.5 border-t">
						<div className="flex items-center gap-1.5  border-neutral-100">
							<Badge
								variant="secondary"
								className="gap-1 font-medium bg-neutral-100 text-neutral-700 border-0 h-6 text-xs"
							>
								<Users className="w-3.5 h-3.5" />
								<span>{(event.total_participants || 0).toLocaleString()}</span>
							</Badge>

							{isTicketBased && event.ticket_sold !== null && (
								<Badge
									variant="secondary"
									className="gap-1 font-medium bg-neutral-100 text-neutral-700 border-0 h-6 text-xs"
								>
									<Ticket className="w-3.5 h-3.5" />
									<span>{event?.ticket_sold?.toLocaleString()}</span>
								</Badge>
							)}

							{isTicketBased && event.total_revenue !== null && (
								<Badge
									variant="secondary"
									className="gap-1 font-medium bg-neutral-100 text-neutral-700 border-0 h-6 text-xs"
								>
									<DollarSign className="w-3.5 h-3.5" />
									<span>${((event.total_revenue || 0) / 100).toLocaleString()}</span>
								</Badge>
							)}

							<Badge
								variant="secondary"
								className="gap-1 font-medium bg-neutral-100 text-neutral-700 border-0 h-6 text-xs"
							>
								<ImageIcon className="w-3.5 h-3.5" />
								<span>{(event.total_uploads || 0).toLocaleString()}</span>
							</Badge>

							{isTicketBased && event?.total_refunds !== null && event.total_refunds! > 0 && (
								<Badge
									variant="secondary"
									className="gap-1 font-medium bg-red-50 text-red-700 border-0 h-6 text-xs"
								>
									<RefreshCw className="w-3.5 h-3.5" />
									<span>${((event.total_refunds || 0) / 100).toLocaleString()}</span>
								</Badge>
							)}
						</div>
						<EventActions eventId={event.id} eventTitle={event.title} isListView />
					</div>
				</div>
			</div>
		</div>
	);
});
