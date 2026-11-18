// Agenda times are Lagos time (WAT, UTC+1 all year), in 15-minute steps inside the event's hours.

const TIME_ZONE = "Africa/Lagos";
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });
const shortDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });
const hhmm = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });

const STEP = 15 * 60 * 1000;

export const formatClock = (iso: string) => clock.format(new Date(iso));
export const formatDay = (iso: string) => shortDay.format(new Date(iso)).replace(",", "");
export const lagosDay = (iso: string) => dayKey.format(new Date(iso));
/** "22:30", the form the lineup's set time is stored in */
export const toHHMM = (iso: string) => hhmm.format(new Date(iso));

export type TimeOption = { value: string; label: string };

/**
 * Every 15 minutes from the event's start to its end (a day from the start when there's no end). Times on a later
 * day than the start say which day, so 1:00 AM reads "1:00 AM · Sun 20 Dec".
 */
export function timeOptions(startsAt: string | null, endsAt: string | null): TimeOption[] {
	if (!startsAt) return [];
	const first = Math.ceil(new Date(startsAt).getTime() / STEP) * STEP;
	const last = endsAt ? new Date(endsAt).getTime() : first + 24 * 60 * 60 * 1000;
	const firstDay = lagosDay(startsAt);
	const options: TimeOption[] = [];
	for (let at = first; at <= last; at += STEP) {
		const iso = new Date(at).toISOString();
		options.push({ value: iso, label: lagosDay(iso) === firstDay ? formatClock(iso) : `${formatClock(iso)} · ${formatDay(iso)}` });
	}
	return options;
}

/** The option a stored "HH:MM" set time matches on the event's night, if any. */
export function optionForHHMM(options: TimeOption[], value: string | null | undefined) {
	if (!value) return "";
	return options.find((option) => toHHMM(option.value) === value.slice(0, 5))?.value ?? "";
}

/** "45 minutes", "1 hour 30 minutes" */
export function describeLength(from: string, to: string) {
	const minutes = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
	if (minutes <= 0) return "";
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	const parts = [hours ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "", rest ? `${rest} minutes` : ""].filter(Boolean);
	return parts.join(" ");
}

/** "Rooftop Sessions runs from 10:00 PM on Sat 19 Dec to 3:00 AM on Sun 20 Dec." */
export function describeRun(title: string, startsAt: string | null, endsAt: string | null) {
	if (!startsAt) return "";
	if (!endsAt) return `${title} starts at ${formatClock(startsAt)} on ${formatDay(startsAt)}.`;
	if (lagosDay(startsAt) === lagosDay(endsAt)) return `${title} runs from ${formatClock(startsAt)} to ${formatClock(endsAt)} on ${formatDay(startsAt)}.`;
	return `${title} runs from ${formatClock(startsAt)} on ${formatDay(startsAt)} to ${formatClock(endsAt)} on ${formatDay(endsAt)}.`;
}
