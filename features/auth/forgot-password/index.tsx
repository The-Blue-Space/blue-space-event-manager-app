"use client";
import * as React from "react";
import { Mail } from "lucide-react";
import forgotPassword from "@/services/account/forgot-password";
import AuthButton from "../components/auth-button";
import AuthField from "../components/auth-field";
import AuthShell from "../components/auth-shell";
import ResendButton from "../components/resend-button";
import { AuthAlert, AuthBackLink, AuthHeading, AuthMeta, AuthSwitch, AuthTextLink, StatusTile } from "../components/auth-ui";
import { RESET_LINK_HOURS } from "../constants";
import { describeError } from "../lib/messages";

const hours = RESET_LINK_HOURS === 1 ? "1 hour" : `${RESET_LINK_HOURS} hours`;

export default function ForgotPassword() {
	const [email, setEmail] = React.useState("");
	const [error, setError] = React.useState<string>();
	const [alert, setAlert] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [sentTo, setSentTo] = React.useState<string | null>(null);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);
		const value = email.trim();
		if (!/^\S+@\S+\.\S+$/.test(value)) {
			setError("Enter a valid email address, like name@example.com.");
			return;
		}
		setIsLoading(true);
		try {
			await forgotPassword({ email: value });
			setSentTo(value);
		} catch (err) {
			setAlert(describeError(err));
		} finally {
			setIsLoading(false);
		}
	};

	if (sentTo) {
		return (
			<AuthShell>
				<div className="grid gap-6">
					<StatusTile kind="info" icon={Mail} />
					<AuthHeading
						title="Check your email"
						description={
							<>
								If there’s a Blue Space account for <strong>{sentTo}</strong>, we’ve sent it a link to reset your
								password. The link expires in {hours}.
							</>
						}
					/>
					<ResendButton label="Resend link" onResend={() => forgotPassword({ email: sentTo })} />
					<AuthMeta>Can’t find it? Check your spam or promotions folder.</AuthMeta>
					<AuthSwitch>
						<AuthTextLink href="/">Back to log in</AuthTextLink>
					</AuthSwitch>
				</div>
			</AuthShell>
		);
	}

	return (
		<AuthShell>
			<div className="grid gap-6">
				<AuthBackLink />
				<AuthHeading
					title="Reset your password"
					description="Enter the email on your Blue Space account and we’ll send you a link to set a new password."
				/>
				{alert && <AuthAlert>{alert}</AuthAlert>}
				<form className="grid gap-4" onSubmit={submit} noValidate>
					<AuthField
						id="email"
						type="email"
						label="Email"
						placeholder="you@example.com"
						autoComplete="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							setError(undefined);
							setAlert(null);
						}}
						disabled={isLoading}
						error={error}
					/>
					<AuthButton type="submit" isLoading={isLoading} loadingText="Sending…">
						Send reset link
					</AuthButton>
					<AuthMeta>This also changes your password in the Blue Space app. It’s the same account.</AuthMeta>
				</form>
			</div>
		</AuthShell>
	);
}
