"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Link2, Send } from "lucide-react";
import EventMenu from "@/features/events/event-actions/event-menu";
import useEventActions, { ActionableEvent, eventLink } from "@/features/events/event-actions/use-event-actions";
import { formatShortDate, formatTime } from "@/features/home/dashboard/format";
import { Pill } from "@/features/home/dashboard/ui";
import { EventSummary } from "@/types/event-summary.types";
import PublishButton from "./publish-button";
import { setupSteps, statusFor } from "./steps";

const TILES = Array.from({ length: 9 }, (_, index) => index === 4);

function Thumbnail({ url }: { url: string | null }) {
	if (url) {
		return (
			<span className="relative size-[72px] shrink-0 overflow-hidden rounded-[14px] bg-auth-info-soft">
				<Image src={url} alt="" fill sizes="72px" className="object-cover" />
			</span>
		);
	}
	return (
		<span aria-hidden="true" className="grid size-[72px] shrink-0 grid-cols-3 gap-1 rounded-[14px] bg-primary-500 p-1.5">
			{TILES.map((lit, index) => (
				<span key={index} className={lit ? "rounded bg-accent-1000" : "rounded bg-auth-tile"} />
			))}
		</span>
	);
}

type EventHeaderProps = {
	summary: EventSummary;
	isBusy: boolean;
	onPublishNow: () => void;
	onPublishLater: () => void;
};

const outlineButton =
	"inline-flex h-10 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover disabled:opacity-60";

export default function EventHeader({ summary, isBusy, onPublishNow, onPublishLater }: EventHeaderProps) {
	const router = useRouter();
	const { event } = summary;
	const status = statusFor(event);
	const stepsLeft = setupSteps(summary).filter((step) => !step.done).length;
	const link = event.published ? eventLink(event.id) : "";
	const actionable: ActionableEvent = { ...event, has_sales: summary.sales.tickets_sold > 0 };
	const menu = <EventMenu event={actionable} variant="header" onDeleted={() => router.replace("/events")} />;
	const { copyLink } = useEventActions();

	const meta = [
		event.starts_at ? `${formatShortDate(event.starts_at)} · ${formatTime(event.starts_at)}` : "No date yet",
		[event.venue_name, event.city].filter(Boolean).join(", ") || "No venue yet",
		event.category,
	].filter(Boolean);

	return (
		<header className="flex flex-wrap items-center gap-x-5 gap-y-4">
			<Thumbnail url={event.cover_url} />
			<div className="grid min-w-[240px] flex-1 gap-1">
				<div className="flex flex-wrap items-center gap-2.5">
					<h1 className="text-[22px] font-bold leading-tight tracking-[-0.01em] text-auth-ink sm:text-[24px]">{event.title}</h1>
					<Pill tone={status.tone}>{status.label}</Pill>
				</div>
				<p className="text-[14px] text-auth-muted">{meta.join(" · ")}</p>
			</div>

			{event.status === "draft" ? (
				<div className="flex items-start gap-2">
					<PublishButton stepsLeft={stepsLeft} isBusy={isBusy} onPublishNow={onPublishNow} onPublishLater={onPublishLater} />
					<div className="pt-0.5">{menu}</div>
				</div>
			) : event.status === "scheduled" ? (
				<div className="flex gap-2">
					<button type="button" onClick={onPublishNow} disabled={isBusy || stepsLeft > 0} className={outlineButton}>
						<Send aria-hidden="true" className="size-4" />
						Publish now
					</button>
					{menu}
				</div>
			) : (
				<div className="flex gap-2">
					{link && (
						<button type="button" onClick={() => copyLink(actionable)} className={outlineButton}>
							<Link2 aria-hidden="true" className="size-4" />
							Copy event link
						</button>
					)}
					{menu}
				</div>
			)}
		</header>
	);
}
