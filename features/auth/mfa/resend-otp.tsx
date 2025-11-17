"use client";
import { variables } from "@/constants";
import useCountdown from "@/hooks/use-countdown";
	
import ensureError from "@/lib/ensure-error";
import sendMFACode from "@/services/account/send-mfa-code";
import * as React from "react";
import { toast } from "sonner";
import useCookie from "@/hooks/use-cookie";

export default React.memo(function ResendOtp({ isVerifyMFA }: { isVerifyMFA?: boolean }) {
	const [isLoading, setIsLoading] = React.useState(false);
	const [counter, reset] = useCountdown(60);
	const { get: getCookie } = useCookie();

	const email = getCookie(variables.STORAGE_KEYS.email, "");

	const resendOtp = async () => {
		setIsLoading(true);
		try {
			if (!email) throw new Error("unable to send OTP, try logging in again");

			await sendMFACode({ email });
			toast.success("OTP sent successfully");
			reset();
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		} finally {
			setIsLoading(false);
		}
	};

	const canResend = counter === 0;

	return (
		<div className="text-center mt-4">
			<p className="body-2 text-gray-600 mb-2">
				{isVerifyMFA ? "Try again?" : "Didn't receive the verification email?"}
			</p>
			{canResend ? (
				<button
					onClick={resendOtp}
					className="body-2 text-primary-300 hover:text-primary-1000 font-medium transition-colors"
					disabled={isLoading}
				>
					Resend verification email
				</button>
			) : (
				<p className="body-2 text-gray-500">
					Resend available in <span className="font-semibold text-primary-300">{counter}s</span>
				</p>
			)}
		</div>
	);
});
