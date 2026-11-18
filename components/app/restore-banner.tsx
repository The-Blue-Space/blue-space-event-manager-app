"use client";
import classNames from "classnames";
import { History } from "lucide-react";

const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** "at 2:41 PM", "yesterday at 2:41 PM" or "on Mon 10 Nov at 2:41 PM". */
function when(ms: number) {
	const then = new Date(ms);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	const time = clock.format(then);
	if (then.toDateString() === today.toDateString()) return `at ${time}`;
	if (then.toDateString() === yesterday.toDateString()) return `yesterday at ${time}`;
	return `on ${day.format(then)} at ${time}`;
}

type RestoreBannerProps = {
	savedAt: number;
	/** Pictures were picked too; those aren't kept on the device. */
	files?: boolean;
	/** "changes" for edits to something saved; "started" for something not created yet. */
	variant?: "changes" | "started";
	onRestore: () => void;
	onDiscard: () => void;
	className?: string;
};

/** Offers back changes kept on this device after the page closed before they were saved. */
export default function RestoreBanner({
	savedAt,
	files,
	variant = "changes",
	onRestore,
	onDiscard,
	className,
}: RestoreBannerProps) {
	const text =
		variant === "started"
			? `You started this ${when(savedAt)} and didn’t finish.`
			: `You have changes from ${when(savedAt).replace(/^at /, "")} that weren’t saved.`;

	return (
		<div
			role="status"
			className={classNames(
				"flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-auth-info-soft px-4 py-3.5 text-primary-500",
				className
			)}
		>
			<div className="flex min-w-0 flex-[1_1_260px] gap-3">
				<History aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" />
				<p className="text-[14px] leading-normal">
					{text}
					{files && " Pictures you picked aren’t kept, so add them again."}
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<button
					type="button"
					onClick={onRestore}
					className="h-9 rounded-lg bg-primary-500 px-3.5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-link focus-visible:ring-offset-2"
				>
					{variant === "started" ? "Pick up where you left off" : "Restore"}
				</button>
				<button
					type="button"
					onClick={onDiscard}
					className="h-9 rounded-lg px-3 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-link"
				>
					{variant === "started" ? "Start over" : "Discard"}
				</button>
			</div>
		</div>
	);
}
