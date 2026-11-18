"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";
import AppButton from "@/components/app/app-button";
import EventMenu from "@/features/events/event-actions/event-menu";
import useEventActions, { ActionableEvent, eventLink } from "@/features/events/event-actions/use-event-actions";
import { formatShortDate, formatTime, plural } from "@/features/home/dashboard/format";
import { Pill } from "@/features/home/dashboard/ui";
import { EventSummary } from "@/types/event-summary.types";
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
	onPublish: () => void;
};

export default function EventHeader({ summary, isBusy, onPublish }: EventHeaderProps) {
	const router = useRouter();
	const { event } = summary;
	const status = statusFor(event);
	const stepsLeft = setupSteps(summary).filter((step) => !step.done).length;
	const isDraft = event.status === "draft" || event.status === "scheduled";
	const link = event.published ? eventLink(event.id) : "";
	const actionable: ActionableEvent = { ...event, has_sales: summary.sales.tickets_sold > 0 };
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

			{isDraft ? (
				<div className="flex items-start gap-2">
					<div className="grid justify-items-end gap-1">
						<AppButton
							variant="primary"
							onClick={onPublish}
							disabled={stepsLeft > 0 || isBusy}
							isLoading={isBusy}
							className="h-11 min-w-[120px] px-5 !text-[15px] font-semibold disabled:bg-[#8E8DB0] disabled:opacity-100"
						>
							Publish
						</AppButton>
						<span className="text-[12px] text-auth-muted">{stepsLeft > 0 ? `${plural(stepsLeft, "step")} left` : "Ready to publish"}</span>
					</div>
					<div className="pt-0.5">
						<EventMenu event={actionable} variant="header" onDeleted={() => router.replace("/events")} />
					</div>
				</div>
			) : (
				<div className="flex gap-2">
					{link && (
						<button
							type="button"
							onClick={() => copyLink(actionable)}
							className="inline-flex h-10 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
						>
							<Link2 aria-hidden="true" className="size-4" />
							Copy event link
						</button>
					)}
					<EventMenu event={actionable} variant="header" onDeleted={() => router.replace("/events")} />
				</div>
			)}
		</header>
	);
}
