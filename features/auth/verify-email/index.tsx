"use client";
import * as React from "react";
import Link from "next/link";
import { Check, LoaderCircle, Mail } from "lucide-react";
import { variables } from "@/constants";
import useCustomNavigation from "@/hooks/use-navigation";
import resendVerificationEmail from "@/services/account/resend-verification-email";
import verifyEmail from "@/services/account/verify-email";
import AuthButton, { authButtonClass } from "../components/auth-button";
import AuthField from "../components/auth-field";
import AuthShell from "../components/auth-shell";
import ResendButton from "../components/resend-button";
import { AuthAlert, AuthHeading, AuthSwitch, AuthTextLink, StatusTile } from "../components/auth-ui";
import { VERIFY_LINK_HOURS } from "../constants";
import { describeError, matches } from "../lib/messages";

type State = "verifying" | "verified" | "already-verified" | "invalid" | "request" | "sent";

const appUrl = variables.EXTERNAL_LINKS.mobile_app;

export default function VerifyEmail() {
	const { queryParams } = useCustomNavigation();
	const token = queryParams.get("token");
	const [state, setState] = React.useState<State>(token ? "verifying" : "request");
	const [email, setEmail] = React.useState("");
	const [emailError, setEmailError] = React.useState<string>();
	const [alert, setAlert] = React.useState<string | null>(null);
	const [isSending, setIsSending] = React.useState(false);
	// Verification links work once. Dev strict mode runs effects twice, so only verify once.
	const started = React.useRef(false);

	React.useEffect(() => {
		if (!token || started.current) return;
		started.current = true;
		verifyEmail({ token })
			.then(() => setState("verified"))
			.catch((error) => {
				if (matches(error, "alreadyVerified")) setState("already-verified");
				else if (matches(error, "verifyTokenInvalid")) setState("invalid");
				else {
					setAlert(describeError(error));
					setState("invalid");
				}
			});
	}, [token]);

	const requestLink = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);
		const value = email.trim();
		if (!/^\S+@\S+\.\S+$/.test(value)) {
			setEmailError("Enter a valid email address, like name@example.com.");
			return;
		}
		setIsSending(true);
		try {
			await resendVerificationEmail({ email: value });
			setState("sent");
		} catch (error) {
			if (matches(error, "alreadyVerified")) setState("already-verified");
			else setAlert(describeError(error));
		} finally {
			setIsSending(false);
		}
	};

	const requestForm = (
		<form className="grid gap-4" onSubmit={requestLink} noValidate>
			<AuthField
				id="email"
				type="email"
				label="Email"
				placeholder="you@example.com"
				autoComplete="email"
				value={email}
				onChange={(e) => {
					setEmail(e.target.value);
					setEmailError(undefined);
					setAlert(null);
				}}
				disabled={isSending}
				error={emailError}
			/>
			<AuthButton type="submit" isLoading={isSending} loadingText="Sending…">
				Send new link
			</AuthButton>
		</form>
	);

	return (
		<AuthShell>
			{state === "verifying" && (
				<div className="grid gap-6" aria-live="polite">
					<StatusTile kind="info" icon={LoaderCircle} spin />
					<AuthHeading title="Verifying your email…" description="This only takes a moment." />
				</div>
			)}

			{(state === "verified" || state === "already-verified") && (
				<div className="grid gap-6">
					<StatusTile kind="success" icon={Check} />
					<AuthHeading
						title={state === "verified" ? "Your email is verified" : "Your email is already verified"}
						description="Your Blue Space account is ready. Log in here to set up your organizer profile, or use the same account in the Blue Space app."
					/>
					<div className="grid gap-2.5">
						<Link href="/" className={authButtonClass("primary")}>
							Continue to log in
						</Link>
						{appUrl && (
							<a href={appUrl} target="_blank" rel="noreferrer" className={authButtonClass("secondary")}>
								Open the Blue Space app
							</a>
						)}
					</div>
				</div>
			)}

			{state === "invalid" && (
				<div className="grid gap-6">
					<StatusTile kind="error" />
					<AuthHeading
						title="This link has expired or was already used"
						description={`Verification links last ${VERIFY_LINK_HOURS} hours and work once. If you already verified your email, you can log in. Otherwise, enter your email and we’ll send you a new link.`}
					/>
					{alert && <AuthAlert>{alert}</AuthAlert>}
					{requestForm}
					<AuthSwitch>
						<AuthTextLink href="/">Back to log in</AuthTextLink>
					</AuthSwitch>
				</div>
			)}

			{state === "request" && (
				<div className="grid gap-6">
					<AuthHeading
						title="Verify your email"
						description={`Enter the email you signed up with and we’ll send you a new verification link. It lasts ${VERIFY_LINK_HOURS} hours.`}
					/>
					{alert && <AuthAlert>{alert}</AuthAlert>}
					{requestForm}
					<AuthSwitch>
						<AuthTextLink href="/">Back to log in</AuthTextLink>
					</AuthSwitch>
				</div>
			)}

			{state === "sent" && (
				<div className="grid gap-6">
					<StatusTile kind="info" icon={Mail} />
					<AuthHeading
						title="Check your email"
						description={
							<>
								We sent a new verification link to <strong>{email.trim()}</strong>. It expires in {VERIFY_LINK_HOURS} hours.
							</>
						}
					/>
					<ResendButton label="Resend email" onResend={() => resendVerificationEmail({ email: email.trim() })} />
					<AuthSwitch>
						<AuthTextLink href="/">Back to log in</AuthTextLink>
					</AuthSwitch>
				</div>
			)}
		</AuthShell>
	);
}
