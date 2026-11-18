import ensureError from "@/lib/ensure-error";
import { AxiosError } from "axios";

/**
 * Server answers we turn into specific UI states instead of showing verbatim. The server sends a code in
 * `error` (blue-space-server/docs/mobile-auth.md); the wording is a fallback for answers that have no code yet.
 */
export const SERVER_MESSAGES = {
	invalidCredentials: { code: "wrong_login", text: "invalid credentials" },
	unverified: { code: "email_not_verified", text: "verify your email address" },
	usernameTaken: { code: "username_taken", text: "username already taken" },
	emailExists: { code: "email_taken", text: "user with this email already exists" },
	verifyTokenInvalid: { code: "", text: "verification token is invalid or expired" },
	resetTokenInvalid: { code: "reset_expired", text: "reset token is invalid or expired" },
	alreadyVerified: { code: "already_verified", text: "email is already verified" },
	userNotFound: { code: "", text: "user not found" },
} as const;

export function serverMessage(err: unknown): string {
	return ensureError(err).message ?? "";
}

export function serverCode(err: unknown): string {
	return err instanceof AxiosError ? (err.response?.data?.error ?? "") : "";
}

export function matches(err: unknown, key: keyof typeof SERVER_MESSAGES): boolean {
	const { code, text } = SERVER_MESSAGES[key];
	if (code && serverCode(err) === code) return true;
	return serverMessage(err).toLowerCase().includes(text);
}

/** A readable sentence for any auth error that has no dedicated UI state. */
export function describeError(err: unknown): string {
	if (err instanceof AxiosError && !err.response) {
		return "We can’t reach Blue Space right now. Check your connection and try again.";
	}
	if (matches(err, "invalidCredentials")) {
		return "That email, username or password is incorrect. Check them and try again.";
	}
	if (serverCode(err) === "too_many_tries" && err instanceof AxiosError) {
		const retryAt = new Date(err.response?.data?.retry_at ?? "");
		if (!Number.isNaN(retryAt.getTime())) {
			const time = retryAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
			return `Too many wrong tries. Try again after ${time}, or reset your password.`;
		}
	}
	if (matches(err, "userNotFound")) {
		return "We couldn’t find a Blue Space account with that email.";
	}
	const message = serverMessage(err).trim();
	if (!message) return "Something went wrong. Try again in a moment.";
	const sentence = message.charAt(0).toUpperCase() + message.slice(1);
	return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

/** ada.obi@gmail.com -> ad•••@gmail.com */
export function maskEmail(email: string): string {
	const [name, domain] = email.split("@");
	if (!domain) return email;
	return `${name.slice(0, 2)}•••@${domain}`;
}
