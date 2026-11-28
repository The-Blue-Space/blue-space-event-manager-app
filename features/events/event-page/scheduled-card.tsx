"use client";
import { CalendarClock } from "lucide-react";
import { dayLabel, dayOf, timeLabel } from "@/features/events/manage-event/tabs/basic-info/lagos-time";

type ScheduledCardProps = {
	publishAt: string;
	isBusy: boolean;
	onChangeTime: () => void;
	onBackToDraft: () => void;
};

/** What's waiting on a scheduled event: when it goes live, and how to change that. */
export default function ScheduledCard({ publishAt, isBusy, onChangeTime, onBackToDraft }: ScheduledCardProps) {
	const at = new Date(publishAt).getTime();
	return (
		<section aria-labelledby="scheduled" className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[14px] border border-auth-line p-5 sm:p-6">
			<span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-auth-warning-soft text-auth-warning">
				<CalendarClock className="size-[22px]" />
			</span>
			<div className="grid min-w-[240px] flex-1 gap-1">
				<h2 id="scheduled" className="text-[18px] font-bold text-auth-ink">
					Publishes {dayLabel(dayOf(at))} at {timeLabel(at)}
				</h2>
				<p className="text-[14px] leading-[1.5] text-auth-muted">
					It goes live on its own. Invites you send before then wait, and go out when it publishes.
				</p>
			</div>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={onChangeTime}
					disabled={isBusy}
					className="h-10 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover disabled:opacity-60"
				>
					Change time
				</button>
				<button
					type="button"
					onClick={onBackToDraft}
					disabled={isBusy}
					className="h-10 rounded-lg px-3.5 text-[14px] font-semibold text-auth-muted transition-colors duration-150 hover:bg-auth-page hover:text-auth-ink disabled:opacity-60"
				>
					Back to draft
				</button>
			</div>
		</section>
	);
}
