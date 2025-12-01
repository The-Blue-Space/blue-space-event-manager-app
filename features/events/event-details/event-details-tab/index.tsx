"use client";

import { Event } from "@/types/event.types";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag, Lock, Ticket, Shield, Car, DollarSign, ImageUp } from "lucide-react";
import Image from "next/image";
import { getDateAndTime } from "@/lib/format-date";

type EventDetailsTabProps = {
	event: Event;
};

export default function EventDetailsTab({ event }: EventDetailsTabProps) {
	const coverImage = event.event_media?.find((m) => m.media_type === "cover")?.url;
	const startDate = event.event_start_date ? getDateAndTime(event.event_start_date) : null;
	const endDate = event.event_end_date ? getDateAndTime(event.event_end_date) : null;

	const accessTypeLabels: Record<string, string> = {
		general: "General",
		individual: "Individual",
		"ticket-based": "Ticket-Based",
		none: "None",
	};

	const refundPolicyLabels: Record<string, string> = {
		"no-refund": "No Refund",
		"partial-refund": "Partial Refund",
		"full-refund": "Full Refund",
	};

	const parkingLabels: Record<string, string> = {
		"free-parking": "Free Parking",
		"paid-parking": "Paid Parking",
		"no-parking": "No Parking",
	};

	return (
		<div className="space-y-6">
			{/* Cover Image */}
			{coverImage && (
				<div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden border border-neutral-200">
					<Image src={coverImage} alt={event.title} fill className="object-cover" priority />
				</div>
			)}

			{/* Core Information */}
			<div className="border border-neutral-200 rounded-lg p-6 space-y-4">
				<h2 className="text-xl font-semibold text-neutral-900">Event Information</h2>

				<div>
					<h3 className="text-2xl font-bold text-primary-600 mb-2">{event.title}</h3>
					<p className="text-neutral-700 whitespace-pre-wrap">{event.description}</p>
				</div>

				{/* Date & Time */}
				<div className="flex items-start gap-3">
					<Calendar className="w-5 h-5 text-neutral-500 mt-0.5" />
					<div>
						<p className="font-medium text-neutral-900">Date & Time</p>
						<p className="text-sm text-neutral-600">
							{startDate?.date} at {startDate?.time}
							{endDate && ` - ${endDate.date} at ${endDate.time}`}
						</p>
					</div>
				</div>

				{/* Location */}
				<div className="flex items-start gap-3">
					<MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
					<div>
						<p className="font-medium text-neutral-900">Location</p>
						<p className="text-sm text-neutral-600">
							{event.venue_name && `${event.venue_name}, `}
							{event.address}, {event.city}
							{event.state && `, ${event.state}`}
							{event.country && `, ${event.country}`}
						</p>
					</div>
				</div>

				{/* Tags */}
				{event.tags && (
					<div className="flex items-start gap-3">
						<Tag className="w-5 h-5 text-neutral-500 mt-0.5" />
						<div className="flex-1">
							<p className="font-medium text-neutral-900 mb-2">Tags</p>
							<div className="flex flex-wrap gap-2">
								{event.tags.map((tag, index) => (
									<Badge key={index} variant="secondary" className="text-xs">
										{tag.trim()}
									</Badge>
								))}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Event Settings */}
			<div className="border border-neutral-200 rounded-lg p-6 space-y-4">
				<h2 className="text-xl font-semibold text-neutral-900">Event Settings</h2>
				<div className="flex gap-3 items-center">
					{/* Privacy */}
					<div className="flex items-start gap-3">
						<Lock className="w-5 h-5 text-neutral-500" />
						<div className="flex-1">
							<p className="font-medium text-neutral-900">Privacy</p>
							<p className="text-sm text-neutral-600">
								{event.is_private ? "Private Event" : "Public Event"}
							</p>
						</div>
					</div>

					{/* Access Type */}
					<div className="flex items-start gap-3">
						<Ticket className="w-5 h-5 text-neutral-500" />
						<div className="flex-1">
							<p className="font-medium text-neutral-900">Access Type</p>
							<p className="text-sm text-neutral-600">
								{accessTypeLabels[event.access_type] || event.access_type}
							</p>
						</div>
					</div>

					{/* Allow Uploads */}
					<div className="flex items-start gap-3">
						<ImageUp className="w-5 h-5 text-neutral-500" />
						<div className="flex-1">
							<p className="font-medium text-neutral-900">Allow Uploads</p>
							<p className="text-sm text-neutral-600">
								{event.allow_individual_upload ? "Yes" : "No"}
							</p>
						</div>
					</div>

					{/* Age Restriction */}
					{event.age_restriction && (
						<div className="flex items-start gap-3">
							<Shield className="w-5 h-5 text-neutral-500" />
							<div className="flex-1">
								<p className="font-medium text-neutral-900">Age Restriction</p>
								<p className="text-sm text-neutral-600">{event.age_restriction}</p>
							</div>
						</div>
					)}

					{/* Parking */}
					{event.parking_type && (
						<div className="flex items-start gap-3">
							<Car className="w-5 h-5 text-neutral-500" />
							<div className="flex-1">
								<p className="font-medium text-neutral-900">Parking</p>
								<p className="text-sm text-neutral-600">
									{parkingLabels[event.parking_type] || event.parking_type}
								</p>
							</div>
						</div>
					)}

					{/* Refund Policy */}
					{event.refund_policy_type && (
						<div className="flex items-start gap-3">
							<DollarSign className="w-5 h-5 text-neutral-500" />
							<div className="flex-1">
								<p className="font-medium text-neutral-900">Refund Policy</p>
								<p className="text-sm text-neutral-600">
									{refundPolicyLabels[event.refund_policy_type] || event.refund_policy_type}
									{event.refund_policy_days && ` (${event.refund_policy_days} days before event)`}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
