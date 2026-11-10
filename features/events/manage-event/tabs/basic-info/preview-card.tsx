"use client";
import classNames from "classnames";
import { Calendar, MapPin } from "lucide-react";
import { DetailsForm } from "./use-details-form";
import { dayLabel, dayOf, timeLabel } from "./lagos-time";
import { useMapsState } from "./venue/maps-health";
import VenueMap from "./venue/venue-map";

/** The tile pattern used wherever an event has no cover yet. */
export function CoverTiles({ size = "md" }: { size?: "md" | "lg" }) {
	return (
		<div
			aria-hidden="true"
			className={classNames("grid grid-cols-3 gap-1 p-[5px]", size === "lg" ? "size-16" : "size-[60px]")}
		>
			{Array.from({ length: 9 }, (_, index) => (
				<span key={index} className={classNames("rounded-[3px]", index === 4 ? "bg-[#FFB703]" : "bg-auth-tile")} />
			))}
		</div>
	);
}

function dateLine(start: number | null, end: number | null) {
	if (start === null) return null;
	const startDay = dayOf(start);
	if (end === null) return `${dayLabel(startDay)} · ${timeLabel(start)}`;
	if (dayOf(end) === startDay) return `${dayLabel(startDay)} · ${timeLabel(start)} – ${timeLabel(end)}`;
	return `${dayLabel(startDay)}, ${timeLabel(start)} – ${dayLabel(dayOf(end))}, ${timeLabel(end)}`;
}

type PreviewCardProps = { form: DetailsForm; coverUrl?: string; className?: string };

/** What the event's key details look like, updated as the organizer edits. */
export default function PreviewCard({ form, coverUrl, className }: PreviewCardProps) {
	const maps = useMapsState();
	const date = dateLine(form.start, form.end);
	const doors =
		form.start !== null && form.doors !== ""
			? `Doors open ${timeLabel(form.start - Number(form.doors) * 60000)}`
			: null;
	const typed = form.venueMode === "manual";
	const venueReady = typed ? Boolean(form.street.trim() && form.city.trim()) : Boolean(form.venueName || form.street);
	const venueName = form.venueName.trim() || form.street.trim();
	const address = [form.venueName.trim() ? form.street.trim() : "", form.city.trim()].filter(Boolean).join(", ");
	const hasPin = Boolean(form.lat && form.lng);

	return (
		<aside aria-label="Preview" className={classNames("grid content-start gap-2.5", className)}>
			<div className="flex items-baseline justify-between">
				<p className="text-[13px] font-semibold text-auth-ink">Preview</p>
				<p className="text-[12px] text-auth-muted">Updates as you edit</p>
			</div>
			<div className="overflow-hidden rounded-[14px] border border-auth-line shadow-[0_1px_2px_rgba(25,24,55,0.04),0_12px_32px_-16px_rgba(25,24,55,0.18)]">
				{coverUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={coverUrl} alt="" className="block aspect-[21/9] w-full object-cover" />
				) : (
					<div className="grid aspect-[21/9] place-items-center bg-primary-500">
						<CoverTiles size="lg" />
					</div>
				)}
				<div className="grid gap-3 px-[18px] pb-[18px] pt-4">
					<p className="text-[17px] font-bold text-auth-ink">{form.title.trim() || "Untitled event"}</p>
					<div className="flex gap-2.5">
						<Calendar aria-hidden="true" className="mt-px size-[18px] shrink-0 text-auth-muted" />
						<div className="grid gap-0.5">
							<span className={classNames("text-[14px] font-semibold", date ? "text-auth-ink" : "text-auth-muted")}>
								{date ?? "Date and time not set yet"}
							</span>
							{doors && <span className="text-[13px] text-auth-muted">{doors}</span>}
						</div>
					</div>
					<div className="flex gap-2.5">
						<MapPin aria-hidden="true" className="mt-px size-[18px] shrink-0 text-auth-muted" />
						<div className="grid gap-0.5">
							<span
								className={classNames("text-[14px] font-semibold", venueReady ? "text-auth-ink" : "text-auth-muted")}
							>
								{venueReady ? venueName : "Venue not set yet"}
							</span>
							{venueReady && address && <span className="text-[13px] text-auth-muted">{address}</span>}
						</div>
					</div>
					{venueReady && hasPin && maps === "ready" && (
						<VenueMap lat={form.lat} lng={form.lng} compact className="pointer-events-none h-[120px] rounded-[10px]" />
					)}
				</div>
			</div>
		</aside>
	);
}
