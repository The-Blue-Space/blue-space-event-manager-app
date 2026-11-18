// Everyone on Blue Space runs events in Nigeria, so dates are shown in Lagos time.
const TIME_ZONE = "Africa/Lagos";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE });
const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE });
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

export const formatNaira = (kobo: number) => naira.format(kobo / 100);
export const formatCount = (value: number) => value.toLocaleString("en-NG");

/** "Sat 21 Nov" */
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso)).replace(",", "");
/** "9 Nov" */
export const formatDayMonth = (iso: string) => dayMonth.format(new Date(iso));
/** "Monday, 9 November" */
export const formatLongDate = (date: Date) => longDate.format(date);
/** "7:00 PM" */
export const formatTime = (iso: string) => clock.format(new Date(iso));

/** Whole days from today to the given instant, counted on Lagos calendar dates. */
export function daysUntil(iso: string) {
	const toDay = (date: Date) => Date.parse(dayKey.format(date));
	return Math.round((toDay(new Date(iso)) - toDay(new Date())) / 86_400_000);
}

/** "today", "tomorrow", "in 12 days" */
export function describeDaysUntil(iso: string) {
	const days = daysUntil(iso);
	if (days <= 0) return "today";
	if (days === 1) return "tomorrow";
	return `in ${days} days`;
}

/** Time for today, "Yesterday", otherwise a short date. */
export function formatWhen(iso: string) {
	const days = daysUntil(iso);
	if (days === 0) return formatTime(iso);
	if (days === -1) return "Yesterday";
	return formatShortDate(iso);
}

export function describeChange(changePct: number | null) {
	if (changePct === null) return "Nothing to compare with yet";
	if (changePct === 0) return "Same as the 30 days before";
	return `${changePct > 0 ? "Up" : "Down"} ${Math.abs(changePct)}% on the 30 days before`;
}

export const plural = (count: number, one: string, many = `${one}s`) => `${formatCount(count)} ${count === 1 ? one : many}`;
