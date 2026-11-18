"use client";
import * as React from "react";
import { toast } from "sonner";
import useCountdown from "@/hooks/use-countdown";
import AuthButton from "./auth-button";
import { RESEND_COOLDOWN_SECONDS } from "../constants";
import { describeError } from "../lib/messages";

type ResendButtonProps = {
	/** e.g. "Resend link". The countdown is appended while waiting. */
	label: string;
	onResend: () => Promise<unknown>;
};

function formatSeconds(total: number) {
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Secondary button that waits out a cooldown first, since an email was just sent. */
export default function ResendButton({ label, onResend }: ResendButtonProps) {
	const [counter, reset] = useCountdown(RESEND_COOLDOWN_SECONDS);
	const [isLoading, setIsLoading] = React.useState(false);
	const [sent, setSent] = React.useState(false);

	const resend = async () => {
		setIsLoading(true);
		try {
			await onResend();
			setSent(true);
			reset();
		} catch (error) {
			toast.error(describeError(error));
		} finally {
			setIsLoading(false);
		}
	};

	const waiting = counter > 0;

	return (
		<div className="grid gap-2.5">
			<AuthButton variant="secondary" onClick={resend} disabled={waiting} isLoading={isLoading} loadingText="Sending…">
				{waiting ? `${label} in ${formatSeconds(counter)}` : label}
			</AuthButton>
			{sent && (
				<p role="status" className="text-center text-[13px] text-auth-success">
					We sent a new link. Check your inbox.
				</p>
			)}
		</div>
	);
}
