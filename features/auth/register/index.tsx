"use client";
import { Mail } from "lucide-react";
import { variables } from "@/constants";
import resendVerificationEmail from "@/services/account/resend-verification-email";
import AuthButton from "../components/auth-button";
import AuthField from "../components/auth-field";
import AuthShell from "../components/auth-shell";
import PasswordRules from "../components/password-rules";
import ResendButton from "../components/resend-button";
import { AuthAlert, AuthHeading, AuthMeta, AuthSteps, AuthSwitch, AuthTextLink, StatusTile } from "../components/auth-ui";
import { VERIFY_LINK_HOURS } from "../constants";
import { meetsPasswordRules } from "../lib/password";
import useRegister from "./use-register";

const { terms, privacy } = variables.EXTERNAL_LINKS;

function LegalLink({ href, children }: { href: string; children: string }) {
	if (!href) return <>{children}</>;
	return (
		<a href={href} target="_blank" rel="noreferrer" className="font-semibold text-auth-link underline-offset-[3px] hover:underline">
			{children}
		</a>
	);
}

export default function Register() {
	const { isLoading, formData, errors, alert, sentTo, attempted, updateForm, submit } = useRegister();

	if (sentTo) {
		return (
			<AuthShell>
				<div className="grid gap-6">
					<StatusTile kind="info" icon={Mail} />
					<AuthHeading
						title="Check your email"
						description={
							<>
								We sent a verification link to <strong>{sentTo}</strong>. Open it to activate your account. The
								link expires in {VERIFY_LINK_HOURS} hours.
							</>
						}
					/>
					<AuthSteps current={0} steps={["Verify your email", "Log in to the portal", "Set up your organizer profile"]} />
					<ResendButton label="Resend email" onResend={() => resendVerificationEmail({ email: sentTo })} />
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
				<AuthHeading title="Create your account" description="One account for the Blue Space app and the organizer portal." />

				{alert && <AuthAlert>{alert}</AuthAlert>}

				<form className="grid gap-4" onSubmit={submit} noValidate>
					<AuthField
						id="name"
						label="Full name"
						placeholder="First and last name"
						autoComplete="name"
						value={formData.name}
						onChange={updateForm}
						disabled={isLoading}
						error={errors.name}
					/>
					<AuthField
						id="username"
						label="Username"
						placeholder="Choose a username"
						autoComplete="username"
						autoCapitalize="none"
						spellCheck={false}
						value={formData.username}
						onChange={updateForm}
						disabled={isLoading}
						error={errors.username}
					/>
					<AuthField
						id="email"
						type="email"
						label="Email"
						placeholder="you@example.com"
						autoComplete="email"
						value={formData.email}
						onChange={updateForm}
						disabled={isLoading}
						error={errors.email}
					/>
					<AuthField
						id="password"
						type="password"
						label="Password"
						placeholder="Create a password"
						autoComplete="new-password"
						value={formData.password}
						onChange={updateForm}
						disabled={isLoading}
						invalid={attempted && !meetsPasswordRules(formData.password)}
						aria-describedby="password-rules"
					/>
					<PasswordRules id="password-rules" password={formData.password} attempted={attempted} />
					<AuthButton type="submit" isLoading={isLoading} loadingText="Creating account…">
						Create account
					</AuthButton>
					<AuthMeta>
						By creating an account, you agree to the Blue Space <LegalLink href={terms}>Terms of Service</LegalLink> and{" "}
						<LegalLink href={privacy}>Privacy Policy</LegalLink>.
					</AuthMeta>
				</form>

				<AuthSwitch>
					Already have an account? <AuthTextLink href="/">Log in</AuthTextLink>
				</AuthSwitch>
			</div>
		</AuthShell>
	);
}
