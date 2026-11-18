/**
 * A random id for this browser, kept in localStorage and sent as X-Device-ID. The server asks for the emailed
 * sign-in link only on a browser it hasn't seen finish one before, and many browsers share a User-Agent, so the id
 * is what tells them apart. Without storage (private mode) there's no id, and every sign-in uses the link.
 */
const KEY = "_BSM_device_id";

export default function deviceId(): string | null {
	if (typeof window === "undefined") return null;
	try {
		let id = window.localStorage.getItem(KEY);
		if (!id) {
			id = crypto.randomUUID();
			window.localStorage.setItem(KEY, id);
		}
		return id;
	} catch {
		return null;
	}
}
