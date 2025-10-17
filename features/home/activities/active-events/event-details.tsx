import {
	Calendar,
	MapPin,
	Users,
	Ticket,
	Clock,
	Circle,
	ImagePlusIcon,
	RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event.types";
import { getDateAndTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getEventMetrics } from "@/services/events";
import { Skeleton } from "@/components/ui/skeleton";
import Render from "@/components/app/render";

type EventDetailsViewProps = {
	event: Event;
};

export default function EventDetailsView({ event }: EventDetailsViewProps) {
	const { date } = getDateAndTime(event.event_start_date || "");

	// Fetch event metrics
	const { data: metrics, isLoading: metricsLoading } = useQuery({
		queryKey: ["event-metrics", event.id],
		queryFn: () => getEventMetrics({ eventId: event.id }),
		enabled: !!event.id,
	});

	// Get cover image from event media
	const coverImage = event.event_media?.find((media) => media.media_type === "cover")?.url;

	const iconCn = cn("w-5 h-5 text-accent-500");

	const metricsData = [
		{
			icon: <Ticket className={iconCn} />,
			label: "Tickets Sold",
			value: metrics?.total_tickets_sold,
		},
		{
			icon: <Users className={iconCn} />,
			label: "Participants",
			value: metrics?.total_participants,
		},
		{
			icon: <ImagePlusIcon className={iconCn} />,
			label: "Uploads",
			value: metrics?.total_uploads,
		},
		{
			icon: <RotateCcw className={iconCn} />,
			label: "Refunds",
			value: metrics?.total_refunds,
		},
	];

	return (
		<div className="space-y-4">
			{/* Event Image */}
			<div className="relative w-full h-48 rounded-lg overflow-hidden bg-neutral-100 group">
				{coverImage ? (
					<Image
						src={coverImage}
						alt={event.title}
						width={600}
						height={192}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-neutral-400">
						<Calendar className="w-16 h-16 text-accent-500" />
					</div>
				)}
				{/* Status Badge */}
				<div className="absolute top-3 right-3">
					<Badge variant="default" className="bg-red-500 flex items-center gap-2">
						<Circle className="w-2 h-2 fill-white  group-hover:animate-none animate-pulse " />
						Live
					</Badge>
				</div>
			</div>

			{/* Event Info */}
			<div className="space-y-3">
				{/* Title & Category */}
				<div>
					<h3 className="text-xl font-bold text-primary-500 mb-1">{event.title}</h3>
					{event.event_category && (
						<Badge variant="outline" className="text-xs bg-accent-500/10 text-accent-500">
							{event.event_category.name}
						</Badge>
					)}
				</div>

				{/* Description */}
				<p className="text-sm text-neutral-600 leading-relaxed">{event.description}</p>

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
				<div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200 mt-auto">
					<Render isLoading={metricsLoading} loadingComponent={<MetricsLoading />}>
						{metricsData.map((metric) => (
							<div className="flex items-center gap-3" key={metric.label}>
								<div className="p-3 rounded-lg bg-accent-500/10">{metric.icon}</div>
								<div>
									<p className="text-xs text-neutral-500">{metric.label}</p>
									<p className="text-lg font-bold text-neutral-900">
										{metric.value?.toLocaleString() || 0}
									</p>
								</div>
							</div>
						))}
					</Render>
				</div>

				{/* Revenue Metric (if available) */}
				{/* {!metricsLoading && metrics?.total_revenue && (
					<div className="pt-3 border-t border-neutral-200">
						<div className="flex items-center gap-3 bg-primary-50 p-3 rounded-lg">
							<div className="p-3 rounded-lg bg-primary-500/10">
								<DollarSign className="w-5 h-5 text-primary-500" />
							</div>
							<div>
								<p className="text-xs text-neutral-500">Total Revenue</p>
								<p className="text-xl font-bold text-primary-500">
									$
									{(metrics.total_revenue / 100).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</p>
							</div>
						</div>
					</div>
				)} */}
			</div>
		</div>
	);
}

function MetricsLoading() {
	return (
		<>
			{[1, 2, 3, 4].map((i) => (
				<div className="flex items-center gap-3" key={i}>
					<Skeleton className="size-14 rounded-lg" />
					<div className="space-y-2 flex-1">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-5 w-12" />
					</div>
				</div>
			))}
		</>
	);
}
