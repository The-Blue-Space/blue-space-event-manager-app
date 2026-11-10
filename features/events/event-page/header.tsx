"use client";
import Image from "next/image";
import { Link2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import AppButton from "@/components/app/app-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { variables } from "@/constants";
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
	onUnpublish: () => void;
};

export default function EventHeader({ summary, isBusy, onPublish, onUnpublish }: EventHeaderProps) {
	const { event } = summary;
	const status = statusFor(event);
	const stepsLeft = setupSteps(summary).filter((step) => !step.done).length;
	const isDraft = event.status === "draft" || event.status === "scheduled";
	const eventLink = variables.EXTERNAL_LINKS.website ? `${variables.EXTERNAL_LINKS.website}/events/${event.id}` : "";

	const meta = [
		event.starts_at ? `${formatShortDate(event.starts_at)} · ${formatTime(event.starts_at)}` : "No date yet",
		[event.venue_name, event.city].filter(Boolean).join(", ") || "No venue yet",
		event.category,
	].filter(Boolean);

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(eventLink);
			toast.success("Event link copied");
		} catch {
			toast.error("We couldn’t copy the link.");
		}
	};

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
			) : (
				<div className="flex gap-2">
					{eventLink && (
						<button
							type="button"
							onClick={copyLink}
							className="inline-flex h-10 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
						>
							<Link2 aria-hidden="true" className="size-4" />
							Copy event link
						</button>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger
							aria-label="More actions"
							className="grid size-10 place-items-center rounded-lg border border-auth-field bg-white text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
						>
							<MoreHorizontal aria-hidden="true" className="size-[18px]" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="font-manrope">
							<DropdownMenuItem onSelect={onUnpublish} disabled={isBusy}>
								Unpublish
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</header>
	);
}
