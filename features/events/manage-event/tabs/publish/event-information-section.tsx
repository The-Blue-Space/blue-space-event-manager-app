import { useEvent } from "../../context";
import { Image as ImageIcon, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { getDateAndTime } from "@/lib/format-date";
import { useMemo } from "react";

export default function EventInformationSection() {
	const { event } = useEvent();

	const coverImage = useMemo(
		() => event?.event_media?.find((media) => media.media_type === "cover"),
		[event?.event_media]
	);

	const formattedStartDate = useMemo(() => {
		if (!event?.event_start_date) return null;
		try {
			const date = new Date(event.event_start_date);
			if (event.event_start_time) {
				const [hours, minutes] = event.event_start_time.split(":");
				date.setHours(Number(hours), Number(minutes), 0, 0);
			}
			return getDateAndTime(date.toISOString(), {
				dateOptions: { dateStyle: "long" },
				timeOptions: event.event_start_time
					? { hour: "2-digit", minute: "2-digit", hour12: true }
					: undefined,
			});
		} catch {
			return null;
		}
	}, [event?.event_start_date, event?.event_start_time]);

	const formattedEndDate = useMemo(() => {
		if (!event?.event_end_date) return null;
		try {
			const date = new Date(event.event_end_date);
			if (event.event_end_time) {
				const [hours, minutes] = event.event_end_time.split(":");
				date.setHours(Number(hours), Number(minutes), 0, 0);
			}
			return getDateAndTime(date.toISOString(), {
				dateOptions: { dateStyle: "long" },
				timeOptions: event.event_end_time
					? { hour: "2-digit", minute: "2-digit", hour12: true }
					: undefined,
			});
		} catch {
			return null;
		}
	}, [event?.event_end_date, event?.event_end_time]);

	return (
		<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-4">
			{/* Cover Image */}
			<div className="relative w-full aspect-video bg-neutral-200 rounded-lg overflow-hidden">
				{coverImage?.url ? (
					<Image
						src={coverImage.url}
						alt={event?.title || "Event cover"}
						fill
						className="object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<ImageIcon className="w-12 h-12 text-neutral-400" />
					</div>
				)}
			</div>

			{/* Event Details */}
			<div className="space-y-3">
				<div>
					<h3 className="body-2 font-semibold text-neutral-900 mb-1">
						{event?.title || "No title"}
					</h3>
					{event?.description && (
						<p className="body-3 text-neutral-600 line-clamp-3">{event.description}</p>
					)}
				</div>

				{/* Date and Time */}
				{formattedStartDate && (
					<div className="flex items-start gap-2">
						<Calendar className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							<p className="body-3 text-neutral-700">
								{formattedStartDate.date}
								{formattedStartDate.time && ` ${formattedStartDate.time}`}
							</p>
							{formattedEndDate && (
								<p className="body-3 text-neutral-500">
									to {formattedEndDate.date}
									{formattedEndDate.time && ` ${formattedEndDate.time}`}
								</p>
							)}
						</div>
					</div>
				)}

				{/* Location */}
				{(event?.address || event?.venue_name) && (
					<div className="flex items-start gap-2">
						<MapPin className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							{event.venue_name && (
								<p className="body-3 font-medium text-neutral-900">{event.venue_name}</p>
							)}
							<p className="body-3 text-neutral-600">
								{event.address}
								{event.city && `, ${event.city}`}
								{event.state && `, ${event.state}`}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
