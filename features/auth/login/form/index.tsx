"use client";
import AuthButton from "../../components/auth-button";
import AuthField from "../../components/auth-field";
import { AuthAlert, AuthHeading, AuthMeta, AuthSwitch, AuthTextLink } from "../../components/auth-ui";
import useForm from "./use-form";

export default function Form() {
	const { isLoading, formData, errors, alert, updateForm, submit } = useForm();
	const credentialsRejected = Boolean(alert) && !alert?.unverified;

	return (
		<div className="grid gap-6">
			<AuthHeading
				title="Log in to Blue Space"
				description="Use your Blue Space account. It’s the same one you use in the app."
			/>

			{alert && (
				<AuthAlert>
					{alert.message}
					{alert.unverified && (
						<>
							{" "}
							<AuthTextLink href="/verify-email">Send a new link</AuthTextLink>
						</>
					)}
				</AuthAlert>
			)}

			<form className="grid gap-4" onSubmit={submit} noValidate>
				<AuthField
					id="login"
					label="Email or username"
					placeholder="you@example.com"
					autoComplete="username"
					value={formData.login}
					onChange={updateForm}
					disabled={isLoading}
					error={errors.login}
					invalid={credentialsRejected}
				/>
				<AuthField
					id="password"
					type="password"
					label="Password"
					placeholder="Enter your password"
					autoComplete="current-password"
					value={formData.password}
					onChange={updateForm}
					disabled={isLoading}
					error={errors.password}
					invalid={credentialsRejected}
					aside={
						<AuthTextLink href="/forgot-password" className="text-[13px]">
							Forgot password?
						</AuthTextLink>
					}
				/>
				<AuthButton type="submit" isLoading={isLoading} loadingText="Logging in…">
					Log in
				</AuthButton>
				<AuthMeta>To keep your account safe, we’ll email you a link to finish logging in.</AuthMeta>
			</form>

			<AuthSwitch>
				New to Blue Space? <AuthTextLink href="/register">Create an account</AuthTextLink>
			</AuthSwitch>
		</div>
	);
}
