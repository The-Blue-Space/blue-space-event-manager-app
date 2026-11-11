"use client";
import classNames from "classnames";
import { AlertCircle, Check, CloudOff, Loader2 } from "lucide-react";
import type { SaveStatus as Status } from "@/hooks/use-saved-form";

const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

type SaveStatusProps = {
	status: Status;
	onRetry: () => void;
	className?: string;
};

/**
 * The one line that tells you where your changes are, on forms that save themselves.
 * It replaces the Save button there, so it sits where the button would.
 */
export default function SaveStatus({ status, onRetry, className }: SaveStatusProps) {
	const { state, savedAt, message, held } = status;

	// "waiting" is temporary (offline, trying again); "problem" needs the person to act.
	let tone: "quiet" | "waiting" | "problem" = "quiet";
	let icon: React.ReactNode = null;
	let text: string;
	let action: string | null = null;

	if (held > 0) {
		tone = "problem";
		icon = <AlertCircle aria-hidden="true" className="size-4 shrink-0" />;
		text = `Fix ${held === 1 ? "1 thing" : `${held} things`} above to save ${held === 1 ? "it" : "them"}.`;
	} else if (state === "saving") {
		icon = <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />;
		text = "Saving…";
	} else if (state === "offline") {
		tone = "waiting";
		icon = <CloudOff aria-hidden="true" className="size-4 shrink-0" />;
		text = "You’re offline. Your changes are kept on this device and save when you’re back.";
	} else if (state === "retrying" || state === "failed") {
		tone = state === "retrying" ? "waiting" : "problem";
		icon = <AlertCircle aria-hidden="true" className="size-4 shrink-0" />;
		text = message ?? "Couldn’t save.";
		action = state === "retrying" ? "Try now" : "Try again";
	} else if (state === "saved" && savedAt) {
		icon = <Check aria-hidden="true" className="size-4 shrink-0 text-auth-success" />;
		text = `Saved at ${clock.format(savedAt)}.`;
	} else {
		text = "Changes save as you go.";
	}

	// Screen readers only hear about problems, not every save.
	const announce = tone === "quiet" ? "" : text;

	return (
		<div className={classNames("flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1", className)}>
			<p
				className={classNames(
					"flex items-center gap-2 text-[13px] leading-[1.45] transition-colors duration-150",
					tone === "problem" ? "text-auth-error" : tone === "waiting" ? "text-auth-warning" : "text-auth-muted"
				)}
			>
				{icon}
				<span>{text}</span>
			</p>
			{action && (
				<button
					type="button"
					onClick={onRetry}
					className="rounded text-[13px] font-semibold text-auth-link underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-link"
				>
					{action}
				</button>
			)}
			<span className="sr-only" aria-live="polite">
				{announce}
			</span>
		</div>
	);
}
