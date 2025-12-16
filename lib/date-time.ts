/**
 * Normalize a time value into HH:mm 24-hour format.
 * Supports ISO strings, HH:mm, HH:mm:ss, and 12-hour strings with AM/PM.
 */
export function normalizeTimeValue(value?: string | null): string {
	if (!value) return "";

	const trimmed = value.trim();
	if (!trimmed) return "";

	// Handle ISO strings
	if (trimmed.includes("T")) {
		const date = new Date(trimmed);
		if (!Number.isNaN(date.getTime())) {
			const hours = date.getHours().toString().padStart(2, "0");
			const minutes = date.getMinutes().toString().padStart(2, "0");
			return `${hours}:${minutes}`;
		}
	}

	// Match HH:mm[:ss] with optional AM/PM
	const timeRegex = /^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s?(AM|PM|am|pm))?$/;
	const match = trimmed.match(timeRegex);
	if (match) {
		let hours = Number(match[1]);
		const minutes = match[2];
		const meridiem = match[3]?.toLowerCase();

		if (meridiem === "pm" && hours < 12) hours += 12;
		if (meridiem === "am" && hours === 12) hours = 0;

		return `${hours.toString().padStart(2, "0")}:${minutes}`;
	}

	// Already HH:mm
	if (/^\d{2}:\d{2}$/.test(trimmed)) {
		return trimmed;
	}

	// Fallback to first 5 characters if possible
	if (trimmed.length >= 5 && trimmed[2] === ":") {
		return trimmed.slice(0, 5);
	}

	return trimmed;
}

/**
 * Merge a date string and time string into a single ISO string.
 */
export function combineDateAndTimeToIso(
	dateStr?: string | null,
	timeStr?: string | null
): string | null {
	if (!dateStr) return null;

	try {
		const date = new Date(dateStr);
		if (Number.isNaN(date.getTime())) return null;

		if (timeStr) {
			const normalized = normalizeTimeValue(timeStr);
			if (normalized) {
				const [hours, minutes] = normalized.split(":").map(Number);
				if (!Number.isNaN(hours)) {
					date.setHours(hours ?? 0);
				}
				if (!Number.isNaN(minutes)) {
					date.setMinutes(minutes ?? 0);
				}
				date.setSeconds(0);
				date.setMilliseconds(0);
			}
		}

		return date.toISOString();
	} catch {
		return null;
	}
}

