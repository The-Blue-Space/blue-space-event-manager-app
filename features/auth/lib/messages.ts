import ensureError from "@/lib/ensure-error";
import { AxiosError } from "axios";

/** Server messages we turn into specific UI states instead of showing verbatim. */
export const SERVER_MESSAGES = {
	invalidCredentials: "invalid credentials",
	unverified: "verify your email address",
	usernameTaken: "username already taken",
	emailExists: "user with this email already exists",
	verifyTokenInvalid: "verification token is invalid or expired",
	resetTokenInvalid: "reset token is invalid or expired",
	alreadyVerified: "email is already verified",
	userNotFound: "user not found",
} as const;

export function serverMessage(err: unknown): string {
	return ensureError(err).message ?? "";
}

export function matches(err: unknown, key: keyof typeof SERVER_MESSAGES): boolean {
	return serverMessage(err).toLowerCase().includes(SERVER_MESSAGES[key]);
}

/** A readable sentence for any auth error that has no dedicated UI state. */
export function describeError(err: unknown): string {
	if (err instanceof AxiosError && !err.response) {
		return "We can’t reach Blue Space right now. Check your connection and try again.";
	}
	if (matches(err, "invalidCredentials")) {
		return "That email, username or password is incorrect. Check them and try again.";
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
