"use client";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import EventMenu from "@/features/events/event-actions/event-menu";
import { setupSteps, statusFor } from "@/features/events/event-page/steps";
import { formatCount, formatShortDate, formatTime, plural } from "@/features/home/dashboard/format";
import { Pill } from "@/features/home/dashboard/ui";
import { ManagerEvent } from "@/types/manager-events.types";

const TILES = Array.from({ length: 9 }, (_, index) => index === 4);

/** The cover, or the indigo tile grid a draft shows until it has one. */
function Cover({ url }: { url: string | null }) {
	if (url) {
		return (
			<span className="relative size-14 shrink-0 overflow-hidden rounded-[10px] bg-auth-info-soft sm:size-16">
				<Image src={url} alt="" fill sizes="64px" className="object-cover" />
			</span>
		);
	}
	return (
		<span aria-hidden="true" className="grid size-14 shrink-0 grid-cols-3 gap-[3px] rounded-[10px] bg-primary-500 p-1.5 sm:size-16">
			{TILES.map((lit, index) => (
				<span key={index} className={lit ? "rounded-[3px] bg-accent-1000" : "rounded-[3px] bg-auth-tile"} />
			))}
		</span>
	);
}

/** "Private, invite only", "One code for everyone", or nothing for an ordinary ticket event. */
function accessNote(event: ManagerEvent) {
	const how =
		event.access_type === "individual" ? "invite only" : event.access_type === "general" ? "one code for everyone" : "";
	const parts = [event.is_private ? "Private" : "", how].filter(Boolean).join(", ");
	return parts ? parts.charAt(0).toUpperCase() + parts.slice(1) : "";
}

export function eventMeta(event: ManagerEvent) {
	const when = event.starts_at ? `${formatShortDate(event.starts_at)} · ${formatTime(event.starts_at)}` : "";
	const where = [event.venue_name ?? event.address, event.city].filter(Boolean).join(", ");
	if (!when && !where) return ["No date or venue yet", accessNote(event)].filter(Boolean).join(" · ");
	return [when || "No date yet", where || "No venue yet", accessNote(event)].filter(Boolean).join(" · ");
}

function Bar({ value, max, tone = "indigo" }: { value: number; max: number; tone?: "indigo" | "green" }) {
	const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
	return (
		<div aria-hidden="true" className="mt-1.5 h-1 w-full max-w-[210px] overflow-hidden rounded-full bg-auth-info-soft">
			<div className={tone === "green" ? "h-full rounded-full bg-auth-success" : "h-full rounded-full bg-primary-500"} style={{ width: `${percent}%` }} />
		</div>
	);
}

/** The one number each kind of event is acted on by. */
function KeyNumber({ event }: { event: ManagerEvent }) {
	const strong = (value: number) => <strong className="font-bold text-auth-ink">{formatCount(value)}</strong>;

	if (event.status === "draft" || event.status === "scheduled") {
		const steps = setupSteps({ event, setup: event.setup });
		const left = steps.filter((step) => !step.done).length;
		return (
			<div>
				<p className="text-[14px] text-auth-muted">
					{left > 0 ? (
						<>
							<strong className="font-bold text-auth-ink">{plural(left, "step")} left</strong> to publish
						</>
					) : (
						<strong className="font-bold text-auth-ink">Ready to publish</strong>
					)}
				</p>
				<Bar value={steps.length - left} max={steps.length} tone="green" />
			</div>
		);
	}

	const tickets = event.access_type === "ticket-based";
	if (event.status === "ended") {
		return (
			<div className="grid justify-items-start gap-0.5">
				<p className="text-[14px] text-auth-muted">
					{tickets ? <>{strong(event.tickets_sold)} tickets sold</> : <>{strong(event.guests_joined)} joined</>}
				</p>
				{event.photos > 0 && (
					<Link
						href={`/events/${event.id}?tab=album`}
						onClick={(e) => e.stopPropagation()}
						className="relative z-10 inline-flex items-center gap-1.5 text-[13px] font-semibold text-auth-link hover:text-primary-500"
					>
						<ImageIcon aria-hidden="true" className="size-3.5" />
						{plural(event.photos, "photo")} and videos
					</Link>
				)}
			</div>
		);
	}

	if (tickets) {
		return (
			<div>
				<p className="text-[14px] text-auth-muted">
					{strong(event.tickets_sold)}
					{event.tickets_total ? <> of {formatCount(event.tickets_total)} sold</> : " sold"}
				</p>
				{event.tickets_total ? <Bar value={event.tickets_sold} max={event.tickets_total} /> : null}
			</div>
		);
	}

	const invited = event.access_type === "individual";
	return (
		<div className="grid justify-items-start gap-1">
			<p className="text-[14px] text-auth-muted">
				{invited ? <>{strong(event.guests_in)} invited</> : <>{strong(event.guests_joined)} joined</>}
			</p>
			{event.guests_waiting > 0 && <Pill tone="warning">{formatCount(event.guests_waiting)} waiting for you</Pill>}
		</div>
	);
}

/** One event on the list. The whole row opens the event; the menu and the album link work on their own. */
export default function EventRow({ event }: { event: ManagerEvent }) {
	const status = statusFor(event);
	return (
		<li className="relative flex items-start gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-auth-page sm:items-center sm:gap-4">
			<Cover url={event.cover_url} />
			<div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(180px,230px)] sm:items-center sm:gap-6">
				<div className="grid min-w-0 gap-1">
					<div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
						<Link
							href={`/events/${event.id}`}
							className="text-[15px] font-bold leading-snug text-auth-ink after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-[10px] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-auth-link"
						>
							{event.title}
						</Link>
						<Pill tone={status.tone}>{status.label}</Pill>
					</div>
					<p className="text-[13px] text-auth-muted sm:text-[14px]">{eventMeta(event)}</p>
				</div>
				<KeyNumber event={event} />
			</div>
			<div className="relative z-10 -mr-1.5 sm:mr-0">
				<EventMenu event={event} />
			</div>
		</li>
	);
}
