"use client";
import AuthContainer from "@/components/app/container/auth-container";

import useStorage from "@/hooks/use-storage";
import { variables } from "@/constants";
import { maskInfo } from "@/lib/mask-info";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import ResendOtp from "./resend-otp";

export default function MFA() {
	const { get } = useStorage();
	const email = get(variables.STORAGE_KEYS.email, "") ?? "";

	const steps = [
		{
			number: 1,
			description: "Check your email inbox for the verification link",
		},

		{
			number: 2,
			description: "Click the verification link in the email",
		},

		{
			number: 3,
			description: "You'll be automatically redirected to your dashboard",
		},
	];

	return (
		<AuthContainer className="lg:!gap-5">
			<div className="bg-white rounded-lg shadow border border-neutral-200 p-8 w-full space-y-4">
				<div className="flex flex-col items-center w-full space-y-1 text-center">
					<Badge className="  flex items-center justify-center w-12 h-12 rounded-full bg-primary-300/10 p-0">
						<Mail className="w-8 h-8 text-primary-300" />
					</Badge>

					<h2 className="heading-7 text-primary-500 mb-2">Verify Session</h2>
					<p className="body-2 text-gray-600 mb-4">We&apos;ve sent a verification link to</p>
					<p className="body-1 font-semibold text-primary-1000">{maskInfo(email, 3, 3)}</p>
				</div>
				<div className=" border-x border-neutral-200 px-6 py-3 mb-0 bg-neutral-200/25">
					<h3 className="body-1 font-semibold text-primary-500 mb-4">Verification steps:</h3>
					<ol className="space-y-3">
						{steps.map((step) => (
							<li key={step.number} className="flex items-start gap-3">
								<span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-300/10 flex items-center justify-center body-4 font-bold text-primary-500">
									{step.number}
								</span>
								<span className="body-2 text-gray-600">{step.description}</span>
							</li>
						))}
					</ol>
				</div>

				{/* Resend Email */}
				<ResendOtp />
			</div>
		</AuthContainer>
	);
}
