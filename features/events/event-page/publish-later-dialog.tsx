"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Info, X } from "lucide-react";
import AppButton from "@/components/app/app-button";
import Field, { controlProps } from "@/components/app/field";
import DateTimeField from "@/features/events/manage-event/tabs/basic-info/date-time-field";
import { fullLabel } from "@/features/events/manage-event/tabs/basic-info/lagos-time";
import ensureError from "@/lib/ensure-error";

type PublishLaterDialogProps = {
	open: boolean;
	eventTitle: string;
	startsAt: string | null;
	publishAt: string | null;
	onClose: () => void;
	onSchedule: (at: number) => Promise<unknown>;
};

/** Pick the day and time an event goes live on its own: after now, and before the event starts. */
export default function PublishLaterDialog({ open, eventTitle, startsAt, publishAt, onClose, onSchedule }: PublishLaterDialogProps) {
	const start = startsAt ? new Date(startsAt).getTime() : null;
	const [at, setAt] = React.useState<number | null>(null);
	const [error, setError] = React.useState("");
	const [saving, setSaving] = React.useState(false);

	React.useEffect(() => {
		if (!open) return;
		setAt(publishAt ? new Date(publishAt).getTime() : null);
		setError("");
	}, [open, publishAt]);

	const outOfRange = start
		? `That time has passed or is after the start. Pick a time between now and ${fullLabel(start)}, when the event starts.`
		: "That time has passed. Pick a time from now on.";

	const schedule = async () => {
		if (at === null) return setError("Pick the day and time it goes live.");
		if (at <= Date.now() || (start !== null && at >= start)) return setError(outOfRange);
		setSaving(true);
		try {
			await onSchedule(at);
		} catch (failure) {
			setError(ensureError(failure).message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<DialogPrimitive.Root open={open} onOpenChange={(next) => !next && !saving && onClose()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(25,24,55,0.45)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
				<DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white font-manrope text-auth-ink shadow-[0_24px_64px_-24px_rgba(25,24,55,0.45)] focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none">
					<header className="flex items-start gap-4 px-6 pt-[22px]">
						<div className="grid flex-1 gap-1">
							<DialogPrimitive.Title className="text-[20px] font-bold">Publish later</DialogPrimitive.Title>
							<DialogPrimitive.Description className="text-[14px] text-auth-muted">
								{eventTitle} goes live on its own at the time you pick.
							</DialogPrimitive.Description>
						</div>
						<DialogPrimitive.Close aria-label="Close" className="-mr-2 grid size-10 place-items-center rounded-lg text-auth-muted hover:bg-auth-page">
							<X aria-hidden="true" className="size-5" />
						</DialogPrimitive.Close>
					</header>
					<div className="grid gap-[18px] px-6 py-5">
						<Field id="publish-at" label="Goes live (Lagos time)" error={error}>
							<DateTimeField
								{...controlProps("publish-at", { error })}
								kind="start"
								value={at}
								onChange={(value) => {
									setAt(value);
									setError("");
								}}
								placeholder="Pick a day and time"
							/>
						</Field>
						{at !== null && !error && (
							<p className="flex gap-2.5 rounded-[10px] bg-auth-info-soft px-3.5 py-3 text-[13.5px] leading-[1.5] text-primary-500">
								<Info aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" />
								<span>
									It goes live on <b>{fullLabel(at)}</b>. Invites you send before then wait, and go out when it publishes.
								</span>
							</p>
						)}
					</div>
					<footer className="flex flex-wrap items-center gap-3 border-t border-auth-line bg-auth-page px-6 py-4">
						<p className="min-w-[200px] flex-1 text-[13px] leading-[1.45] text-auth-muted">
							You can publish it sooner, change the time, or take it back to draft until then.
						</p>
						<DialogPrimitive.Close
							disabled={saving}
							className="h-11 rounded-lg px-4 text-[15px] font-semibold text-auth-muted transition-colors duration-150 hover:bg-auth-info-soft hover:text-auth-ink"
						>
							Cancel
						</DialogPrimitive.Close>
						<AppButton variant="primary" onClick={schedule} isLoading={saving} className="h-11 min-w-[140px] px-5 !text-[15px] font-semibold">
							Schedule
						</AppButton>
					</footer>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
