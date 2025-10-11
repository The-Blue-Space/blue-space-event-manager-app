"use client";
import AuthContainer from "@/components/app/container/auth-container";
import { variables } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Loader2, MailCheck, MailX } from "lucide-react";
import { useEffect, useState } from "react";
import useCustomNavigation from "@/hooks/use-navigation";
import verifyMFA from "@/services/account/verify-mfa";
import ensureError from "@/lib/ensure-error";
import { toast } from "sonner";
import useCookie from "@/hooks/use-cookie";
import Link from "next/link";
import ResendOtp from "../mfa/resend-otp";

export default function VerifyMFA() {
	const { set: setCookie } = useCookie();
	const { queryParams, navigate } = useCustomNavigation();
	const [verificationState, setVerificationState] = useState<"loading" | "success" | "error">(
		"loading"
	);

	useEffect(() => {
		const token = queryParams.get("token");
		if (!token) {
			setVerificationState("error");
			return;
		}
		const submit = async () => {
			try {
				const res = await verifyMFA({ token });
				if (res) {
					setVerificationState("success");
					setCookie(variables.STORAGE_KEYS.session, res.access_token, {
						expires: res.expires_in,
					});
					setCookie(variables.STORAGE_KEYS.manager_profile_id, res.manager_profile.id);

					navigate("/dashboard", { replace: true });
				}
			} catch (error) {
				const errMsg = ensureError(error).message;
				toast.error(errMsg);
				setVerificationState("error");
				throw error;
			}
		};

		submit();
	}, []);

	if (verificationState === "loading") {
		return (
			<AuthContainer>
				<div className="bg-white rounded-lg shadow border border-neutral-200 p-8 w-full">
					<div className="flex flex-col items-center w-full space-y-0 text-center">
						<div className="w-16 h-16 rounded-full bg-primary-300/10 flex items-center justify-center mb-4">
							<Loader2 className="w-8 h-8 text-primary-300  animate-spin" />
						</div>
						<h2 className="heading-7 text-primary-500 mb-2">Verifying...</h2>
						<p className="body-2 text-gray-600 mb-4">verifying session, do not exit the page</p>
					</div>
				</div>
			</AuthContainer>
		);
	}

	if (verificationState === "success") {
		return (
			<AuthContainer>
				<div className="bg-white rounded-lg shadow border border-neutral-200 p-8 w-full">
					<div className="flex flex-col items-center w-full space-y-0 text-center">
						<Badge className="  flex items-center justify-center w-16 h-16 rounded-full bg-primary-300/10 p-0">
							<MailCheck className="w-8 h-8 text-primary-300" />
						</Badge>

						<h2 className="heading-7 text-primary-500 mb-2">Session Verified</h2>
						<p className="body-2 text-gray-600 mb-4">Redirecting you to your dashboard...</p>
					</div>
				</div>
			</AuthContainer>
		);
	}

	return (
		<AuthContainer>
			<div className="bg-white rounded-lg shadow border border-neutral-200 p-8 w-full">
				<div className="flex flex-col items-center w-full space-y-1 text-center">
					<Badge className="  flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 p-0">
						<MailX className="w-8 h-8 text-red-500" />
					</Badge>

					<h2 className="heading-7 text-primary-500 mb-2">Verification Failed</h2>
					<p className="body-2 text-neutral-600 mb-4">Failed to verify session</p>
				</div>

				<ResendOtp isVerifyMFA />
			</div>
			<div className="mt-6 text-center">
				<p className="body-3 text-gray-500">
					Need help?{" "}
					<Link href="#" className="text-primary-300 hover:text-primary-1000 transition-colors">
						Contact support
					</Link>
				</p>
			</div>
		</AuthContainer>
	);
}
