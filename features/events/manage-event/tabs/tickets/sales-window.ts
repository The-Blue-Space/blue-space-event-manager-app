import { instant, lagosInstantString, longDuration, sameMinute, shortWhen } from "./format";

// Sales windows are saved as fixed instants. "When the event starts" saves the event's start time,
// so moving the event later doesn't move the window (a known gap, same as Doors open).

/** "now": as soon as you publish (drafts) or save (published events). */
export type StartMode = "now" | "pick";
export type EndMode = "start" | "end" | "pick";

export type EventTimes = { startsAt: number | null; endsAt: number | null; published: boolean };

export type Window = { startMode: StartMode; start: number | null; endMode: EndMode; end: number | null };

type Saved = { sales_start_date?: string | null; sales_end_date?: string | null; created_at?: string };

export const NEW_WINDOW: Window = { startMode: "now", start: null, endMode: "start", end: null };

/** Reads a saved window back into the form's modes. */
export function readWindow(saved: Saved, times: EventTimes): Window {
	const start = instant(saved.sales_start_date);
	const end = instant(saved.sales_end_date);
	// In a draft, a start saved at the moment the item was made (to the minute) means "as soon as you
	// publish". Once published, the real date is clearer than "as soon as you save".
	const created = instant(saved.created_at);
	const startMode: StartMode =
		!times.published && start !== null && created !== null && Math.abs(start - created) < 120_000 ? "now" : "pick";
	const endMode: EndMode = sameMinute(end, times.startsAt) ? "start" : sameMinute(end, times.endsAt) ? "end" : "pick";
	return { startMode, start, endMode, end };
}

export const startOptions = (published: boolean) => [
	{ value: "now", label: published ? "As soon as you save" : "As soon as you publish" },
	{ value: "pick", label: "At a date and time you pick" },
];

export const endOptions = (times: EventTimes) => [
	{
		value: "start",
		label: times.startsAt !== null ? `When the event starts (${shortWhen(times.startsAt)})` : "When the event starts",
	},
	{
		value: "end",
		label: times.endsAt !== null ? `When the event ends (${shortWhen(times.endsAt)})` : "When the event ends",
	},
	{ value: "pick", label: "At a date and time you pick" },
];

export const resolveEnd = (window: Window, times: EventTimes) =>
	window.endMode === "start" ? times.startsAt : window.endMode === "end" ? times.endsAt : window.end;

/** Field errors for the window, keyed "start" and "end". */
export function windowErrors(window: Window, times: EventTimes) {
	const errors: { start?: string; end?: string } = {};
	if (window.startMode === "pick" && window.start === null) errors.start = "Pick when sales start.";
	const end = resolveEnd(window, times);
	if (window.endMode === "pick" && window.end === null) errors.end = "Pick when sales end.";
	else if (end === null) errors.end = "Add the event’s date on Details first, or pick a date.";
	else {
		const start = window.startMode === "pick" ? window.start : Date.now();
		if (start !== null && end <= start) errors.end = "Sales have to end after they start.";
	}
	return errors;
}

/** "An hour before the event starts." for a picked end. */
export function endHint(window: Window, times: EventTimes) {
	if (window.endMode !== "pick" || window.end === null || times.startsAt === null) return undefined;
	const before = times.startsAt - window.end;
	if (before <= 0) return undefined;
	const text = longDuration(before);
	return `${text === "1 hour" ? "An hour" : text.charAt(0).toUpperCase() + text.slice(1)} before the event starts.`;
}

/**
 * The instants to save. `kept` is the saved start, kept as it is when the start mode didn't change, so
 * editing a ticket type doesn't move when its sales started.
 */
export function windowPayload(window: Window, times: EventTimes, kept: Window | null) {
	const start =
		window.startMode === "pick"
			? (window.start as number)
			: kept?.startMode === "now" && kept.start !== null
				? kept.start
				: Date.now();
	const end = resolveEnd(window, times) as number;
	return {
		sales_start_date: lagosInstantString(start),
		sales_start_time: lagosInstantString(start),
		sales_end_date: lagosInstantString(end),
		sales_end_time: lagosInstantString(end),
	};
}
