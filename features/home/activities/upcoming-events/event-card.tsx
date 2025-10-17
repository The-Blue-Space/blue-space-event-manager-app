import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Ticket, Clock } from "lucide-react";
import { Event } from "@/types/event.types";
import { getDateAndTime } from "@/lib/format-date";
import Image from "next/image";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Link from "next/link";
import { variables } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { getEventMetrics } from "@/services/events";

type EventCardProps = {
	event: Event;
	scope: "user" | "other";
};

export default function EventCard({ event, scope }: EventCardProps) {
	const { date } = getDateAndTime(event.event_start_date || "");

	// Fetch event metrics for hover card
	const { data: metrics } = useQuery({
		queryKey: ["event-metrics", event.id],
		queryFn: () => getEventMetrics({ eventId: event.id }),
		enabled: !!event.id,
	});

	// Extract day and month from event_start_date
	const eventDate = new Date(event.event_start_date || "");
	const day = eventDate.getDate();
	const month = eventDate.toLocaleDateString("en-US", { month: "short" });

	const isUser = scope === "user";

	const path = isUser
		? `/events/${event.id}`
		: `${variables.EXTERNAL_LINKS.website}/events/${event.id}`;

	// Get cover image from event media
	const coverImage = event.event_media?.find((media) => media.media_type === "cover")?.url;

	return (
		<HoverCard openDelay={1000}>
			<HoverCardTrigger asChild>
				<Link
					href={path}
					target={isUser ? "_self" : "_blank"}
					className="flex gap-3 p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all cursor-pointer group"
				>
					{/* Event Image */}
					<div className="relative w-28 h-24 flex-shrink-0 rounded-md overflow-hidden bg-neutral-100">
						{coverImage ? (
							<Image
								src={coverImage}
								alt={event.title}
								width={112}
								height={96}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-neutral-400">
								<Calendar className="w-8 h-8 text-accent-500" />
							</div>
						)}
						{/* Event Date Badge on Image */}
						<div className="absolute -top-2 right-0">
							<Badge
								variant={"default"}
								className="text-[8px] flex-col rounded-none rounded-tr-lg bg-accent-500"
							>
								<p className="leading-tight">{day}</p>
								<p className="leading-tight">{month}</p>
							</Badge>
						</div>
					</div>

					{/* Event Details */}
					<div className="flex-1 flex flex-col justify-between min-w-0">
						{/* Title and Category */}
						<div>
							<h3 className="font-semibold text-sm text-primary-500 truncate group-hover:text-primary transition-colors">
								{event.title}
							</h3>
							<p className="text-xs text-neutral-500 mt-0.5">
								{event.event_category?.name || "Uncategorized"}
							</p>
						</div>

						{/* Date and Location */}
						<div className="space-y-1">
							<div className="flex items-center gap-1.5 text-xs text-neutral-600">
								<Calendar className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" />
								<span className="truncate">
									{date}
									{event.event_start_time && ` at ${event.event_start_time}`}
								</span>
							</div>
							<div className="flex items-center gap-1.5 text-xs text-neutral-600">
								<MapPin className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" />
								<span className="truncate">{event.city || event.address}</span>
							</div>
						</div>

						{/* Metrics */}
						{metrics && (
							<div className="flex items-center gap-4 mt-2">
								<div className="flex items-center gap-1.5 text-xs text-neutral-600">
									<Ticket className="w-3.5 h-3.5 text-accent-500" />
									<span className="font-medium">{metrics.total_tickets_sold.toLocaleString()}</span>
									<span className="text-neutral-400">sold</span>
								</div>
								<div className="flex items-center gap-1.5 text-xs text-neutral-600">
									<Users className="w-3.5 h-3.5 text-accent-500" />
									<span className="font-medium">{metrics.total_participants.toLocaleString()}</span>
								</div>
							</div>
						)}
					</div>
				</Link>
			</HoverCardTrigger>

			{/* Hover Preview */}
			<HoverCardContent
				className="w-full max-w-96 bg-transparent border-none shadow-none"
				side="right"
			>
				<div className=" ml-4  z-50 w-full">
					<Card className="shadow-xl border-2 border-neutral-200">
						<CardContent className="p-4">
							{/* Event Image */}
							<div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 bg-neutral-100">
								{coverImage ? (
									<Image
										src={coverImage}
										alt={event.title}
										width={320}
										height={160}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-neutral-400">
										<Calendar className="w-16 h-16 text-accent-500" />
									</div>
								)}
							</div>

							{/* Event Details */}
							<div className="space-y-3">
								{/* Title & Category */}
								<div>
									<h3 className="font-bold text-lg text-primary-500 mb-1">{event.title}</h3>
									<Badge variant="outline" className="text-xs bg-accent-500/10 text-accent-500">
										{event.event_category?.name || "Uncategorized"}
									</Badge>
								</div>

								{/* Description */}
								<p className="text-sm text-neutral-600 line-clamp-3">{event.description}</p>

								{/* Date & Time */}
								<div className="flex items-start gap-2 text-sm">
									<Calendar className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
									<div>
										<p className="font-medium text-neutral-900">{date}</p>
										{event.event_start_time && event.event_end_time && (
											<div className="flex items-center gap-1 text-xs text-neutral-600">
												<Clock className="w-3 h-3" />
												<span>
													{event.event_start_time} - {event.event_end_time}
												</span>
											</div>
										)}
									</div>
								</div>

								{/* Location */}
								<div className="flex items-start gap-2 text-sm">
									<MapPin className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
									<p className="text-neutral-600">{event.address || event.city}</p>
								</div>

								{/* Metrics */}
								{metrics && (
									<div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
										<div className="flex items-center gap-2">
											<div className="p-2 rounded-lg bg-accent-500/10">
												<Ticket className="w-4 h-4 text-accent-500" />
											</div>
											<div>
												<p className="text-xs text-neutral-500">Tickets Sold</p>
												<p className="text-sm font-semibold text-neutral-900">
													{metrics.total_tickets_sold.toLocaleString()}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="p-2 rounded-lg bg-accent-500/10">
												<Users className="w-4 h-4 text-accent-500" />
											</div>
											<div>
												<p className="text-xs text-neutral-500">Participants</p>
												<p className="text-sm font-semibold text-neutral-900">
													{metrics.total_participants.toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
