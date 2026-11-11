import {
	dayLabel,
	dayOf,
	fullLabel,
	isSetInstant,
	lagosInstantString,
	longDuration,
	timeLabel,
} from "../basic-info/lagos-time";

// The server keeps money as integer kobo. The forms take whole naira, so they save naira × 100.
export const KOBO_PER_NAIRA = 100;

/** Keeps only the digits someone typed, so "12,000" stays "12000". */
export const digits = (value: string) => value.replace(/[^0-9]/g, "");

/** "12000" → "12,000" */
export const commas = (value: number | string) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Whole naira, "₦12,000". */
export const naira = (amount: number) => `₦${commas(Math.round(amount))}`;

/** Stored kobo as "₦12,000". */
export const nairaFromKobo = (kobo: number) => naira(kobo / KOBO_PER_NAIRA);

/** Kobo as naira, with kobo only when there are some: "₦12,948", "₦13,320.26". */
export const nairaFromKoboExact = (kobo: number) => {
	const whole = Math.trunc(kobo / KOBO_PER_NAIRA);
	const rest = Math.abs(kobo % KOBO_PER_NAIRA);
	return rest ? `₦${commas(whole)}.${String(rest).padStart(2, "0")}` : `₦${commas(whole)}`;
};

export const toKobo = (nairaDigits: string) => Number(nairaDigits || 0) * KOBO_PER_NAIRA;

/** Stored kobo back to the digits a form shows. */
export const koboToDigits = (kobo: number | null | undefined) =>
	kobo ? String(Math.round(kobo / KOBO_PER_NAIRA)) : "";

/** "Sat 21 Nov, 6:00 PM" */
export const shortWhen = (ms: number) => `${dayLabel(dayOf(ms))}, ${timeLabel(ms)}`;

/** "12 Oct" */
export const dayMonth = (ms: number) => dayLabel(dayOf(ms)).split(" ").slice(1).join(" ");

export { fullLabel, lagosInstantString, longDuration };

export const instant = (iso?: string | null) => (isSetInstant(iso) ? new Date(iso as string).getTime() : null);

/** Two instants within a minute of each other count as the same time. */
export const sameMinute = (a: number | null, b: number | null) => a !== null && b !== null && Math.abs(a - b) < 60_000;

export const plural = (count: number, one: string, many = `${one}s`) => `${commas(count)} ${count === 1 ? one : many}`;
