"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import classNames from "classnames";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";

type ConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	text: string;
	confirmLabel: string;
	/** "danger" for things that can't be undone */
	tone?: "danger" | "primary";
	icon: React.ReactNode;
	/** Runs when confirmed. The dialog closes when it resolves, and stays open with a toast when it throws. */
	onConfirm: () => Promise<void> | void;
};

/** A small centred question before something that's hard to take back: an icon, what happens, Cancel and the action. */
export default function ConfirmDialog({ open, onOpenChange, title, text, confirmLabel, tone = "danger", icon, onConfirm }: ConfirmDialogProps) {
	const [busy, setBusy] = React.useState(false);

	const confirm = async () => {
		setBusy(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} catch (error) {
			toast.error(ensureError(error).message);
		} finally {
			setBusy(false);
		}
	};

	return (
		<DialogPrimitive.Root open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(25,24,55,0.35)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
				<DialogPrimitive.Content
					role="alertdialog"
					onClick={(e) => e.stopPropagation()}
					className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl bg-white p-6 font-manrope text-auth-ink shadow-[0_24px_64px_-24px_rgba(25,24,55,0.45)] focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none"
				>
					<span
						aria-hidden="true"
						className={classNames(
							"grid size-11 place-items-center rounded-xl [&_svg]:size-5",
							tone === "danger" ? "bg-auth-error-soft text-auth-error" : "bg-auth-info-soft text-primary-500"
						)}
					>
						{icon}
					</span>
					<div className="grid gap-2">
						<DialogPrimitive.Title className="text-[18px] font-bold leading-[1.3]">{title}</DialogPrimitive.Title>
						<DialogPrimitive.Description className="text-[14px] leading-[1.55] text-auth-muted">{text}</DialogPrimitive.Description>
					</div>
					<div className="flex justify-end gap-3">
						<DialogPrimitive.Close
							disabled={busy}
							className="h-11 rounded-lg px-4 text-[15px] font-semibold text-auth-muted transition-colors duration-150 hover:bg-auth-page hover:text-auth-ink disabled:opacity-60"
						>
							Cancel
						</DialogPrimitive.Close>
						<button
							type="button"
							onClick={confirm}
							disabled={busy}
							aria-busy={busy}
							className={classNames(
								"h-11 rounded-lg px-5 text-[15px] font-semibold text-white transition-colors duration-150 disabled:cursor-wait disabled:opacity-80",
								tone === "danger" ? "bg-auth-error hover:bg-auth-error-ink" : "bg-primary-500 hover:bg-primary-600"
							)}
						>
							{busy ? `${confirmLabel}…` : confirmLabel}
						</button>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
