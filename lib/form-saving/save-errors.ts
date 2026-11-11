import { isAxiosError } from "axios";
import ensureError from "@/lib/ensure-error";

/**
 * What a failed save means for trying again:
 * - retry: the network or the server had a moment (no answer, timeout, 5xx, 429). Try again on our own.
 * - signed-out: the session ended. The sign-in flow takes over; the device backup keeps the changes.
 * - rejected: the server said no to these values (4xx). Trying again won't help until they change.
 */
export type SaveFailure = { kind: "retry" | "signed-out" | "rejected"; message: string };

export function describeSaveError(error: unknown): SaveFailure {
	if (isAxiosError(error)) {
		const status = error.response?.status;
		if (!status || status === 408 || status === 429 || status >= 500) {
			return { kind: "retry", message: "Couldn’t save. Trying again…" };
		}
		// The sign-in check answers 401 about the token; a 401 from the save itself means this person can't change it.
		const serverMessage = (error.response?.data as { message?: unknown } | undefined)?.message;
		if (status === 401 && (typeof serverMessage !== "string" || /token|authorization/i.test(serverMessage))) {
			return { kind: "signed-out", message: "Sign in again to save. Your changes are kept on this device." };
		}
	}
	return { kind: "rejected", message: ensureError(error).message || "We couldn’t save your changes." };
}

/** 2s, 4s, 8s, 16s, then every 30s. */
export const retryDelay = (attempt: number) => Math.min(30_000, 2_000 * 2 ** attempt);
