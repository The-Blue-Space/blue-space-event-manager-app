"use client";
import * as React from "react";
import { Mail } from "lucide-react";
import { variables } from "@/constants";
import useCookie from "@/hooks/use-cookie";
import sendMFACode from "@/services/account/send-mfa-code";
import AuthShell from "../components/auth-shell";
import ResendButton from "../components/resend-button";
import { AuthHeading, AuthSwitch, AuthTextLink, StatusTile } from "../components/auth-ui";
import { SIGN_IN_LINK_MINUTES } from "../constants";
import { maskEmail } from "../lib/messages";

export default function MFA() {
	const { get: getCookie } = useCookie();
	// Read after mount: the cookie is only available in the browser.
	const [email, setEmail] = React.useState<string | null>(null);

	React.useEffect(() => {
		setEmail(getCookie<string>(variables.STORAGE_KEYS.email, "") ?? "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sentTo = email ? <strong>{maskEmail(email)}</strong> : "your email";

	return (
		<AuthShell>
			<div className="grid gap-6">
				<StatusTile kind="info" icon={Mail} />
				<AuthHeading
					title="Check your email to finish logging in"
					description={
						<>
							We sent a sign-in link to {sentTo}. Open it on this device. It expires in{" "}
							{SIGN_IN_LINK_MINUTES} minutes.
						</>
					}
				/>
				{email && <ResendButton label="Resend link" onResend={() => sendMFACode({ email })} />}
				<AuthSwitch>
					<AuthTextLink href="/">Log in with a different account</AuthTextLink>
				</AuthSwitch>
			</div>
		</AuthShell>
	);
}
