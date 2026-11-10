"use client";
import * as React from "react";
import Link from "next/link";
import classNames from "classnames";
import { Check } from "lucide-react";
import { variables } from "@/constants";
import useCustomNavigation from "@/hooks/use-navigation";
import resetPassword from "@/services/account/reset-password";
import AuthButton, { authButtonClass } from "../components/auth-button";
import AuthField from "../components/auth-field";
import AuthShell from "../components/auth-shell";
import { AuthAlert, AuthHeading, AuthSwitch, AuthTextLink, StatusTile } from "../components/auth-ui";
import { PASSWORD_MIN_LENGTH, RESET_LINK_HOURS } from "../constants";
import { describeError, matches } from "../lib/messages";

type State = "form" | "updated" | "invalid";

const appUrl = variables.EXTERNAL_LINKS.mobile_app;
const hours = RESET_LINK_HOURS === 1 ? "1 hour" : `${RESET_LINK_HOURS} hours`;

export default function ResetPassword() {
	const { queryParams } = useCustomNavigation();
	const token = queryParams.get("token");
	const [state, setState] = React.useState<State>(token ? "form" : "invalid");
	const [password, setPassword] = React.useState("");
	const [confirm, setConfirm] = React.useState("");
	const [errors, setErrors] = React.useState<{ confirm?: string }>({});
	const [submitted, setSubmitted] = React.useState(false);
	const [alert, setAlert] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);

	const longEnough = password.length >= PASSWORD_MIN_LENGTH;

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);
		setSubmitted(true);
		const next: typeof errors = {};
		if (confirm !== password) next.confirm = "Passwords don’t match.";
		setErrors(next);
		if (!longEnough || next.confirm || !token) return;

		setIsLoading(true);
		try {
			await resetPassword({ token, password });
			setState("updated");
		} catch (error) {
			if (matches(error, "resetTokenInvalid")) setState("invalid");
			else setAlert(describeError(error));
		} finally {
			setIsLoading(false);
		}
	};

	if (state === "updated") {
		return (
			<AuthShell>
				<div className="grid gap-6">
					<StatusTile kind="success" icon={Check} />
					<AuthHeading
						title="Password updated"
						description="Log in with your new password. It works in the portal and in the Blue Space app."
					/>
					<div className="grid gap-2.5">
						<Link href="/" className={authButtonClass("primary")}>
							Log in to the portal
						</Link>
						{appUrl && (
							<a href={appUrl} target="_blank" rel="noreferrer" className={authButtonClass("secondary")}>
								Open the Blue Space app
							</a>
						)}
					</div>
				</div>
			</AuthShell>
		);
	}

	if (state === "invalid") {
		return (
			<AuthShell>
				<div className="grid gap-6">
					<StatusTile kind="error" />
					<AuthHeading
						title={token ? "This reset link has expired or was already used" : "This reset link isn’t complete"}
						description={
							token
								? `Reset links last ${hours} and work once. Ask for a new one to set your password.`
								: "Open the link from your email again, or ask for a new one."
						}
					/>
					<Link href="/forgot-password" className={authButtonClass("primary")}>
						Get a new reset link
					</Link>
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
				<AuthHeading
					title="Set a new password"
					description="Choose a new password for your Blue Space account. You’ll use it in the portal and in the app."
				/>
				{alert && <AuthAlert>{alert}</AuthAlert>}
				<form className="grid gap-4" onSubmit={submit} noValidate>
					<AuthField
						id="password"
						type="password"
						label="New password"
						placeholder="New password"
						autoComplete="new-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isLoading}
						invalid={submitted && !longEnough}
						aria-describedby="password-rules"
					/>
					<ul id="password-rules" className="-mt-1 grid gap-1.5" aria-live="polite">
						<li
							className={classNames(
								"flex items-center gap-2 text-[13px]",
								longEnough ? "text-auth-success" : submitted ? "font-semibold text-auth-error" : "text-auth-muted"
							)}
						>
							<span
								className={classNames(
									"grid size-4 place-items-center rounded-full border",
									longEnough ? "border-auth-success bg-auth-success" : submitted ? "border-auth-error" : "border-auth-field"
								)}
							>
								{longEnough && <Check aria-hidden="true" strokeWidth={3} className="size-2.5 text-white" />}
							</span>
							At least {PASSWORD_MIN_LENGTH} characters
							<span className="sr-only">{longEnough ? "(done)" : "(not yet)"}</span>
						</li>
					</ul>
					<AuthField
						id="confirm"
						type="password"
						label="Confirm new password"
						placeholder="Type it again"
						autoComplete="new-password"
						value={confirm}
						onChange={(e) => {
							setConfirm(e.target.value);
							setErrors((prev) => ({ ...prev, confirm: undefined }));
						}}
						disabled={isLoading}
						error={errors.confirm}
					/>
					<AuthButton type="submit" isLoading={isLoading} loadingText="Updating…">
						Update password
					</AuthButton>
				</form>
			</div>
		</AuthShell>
	);
}
