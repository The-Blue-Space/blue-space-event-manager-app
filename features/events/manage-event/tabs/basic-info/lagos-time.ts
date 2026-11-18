// Events run in Nigeria: West Africa Time, UTC+1 all year with no daylight saving. The form works in Lagos
// wall-clock time, kept as instants (epoch ms), and saves RFC3339 strings with the +01:00 offset.
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const LAGOS_OFFSET = HOUR;

const weekday = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short" });
const month = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "short" });
const monthLong = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric" });

/** Lagos calendar day of an instant, as a day count since 1970-01-01. */
export const dayOf = (ms: number) => Math.floor((ms + LAGOS_OFFSET) / DAY);

/** Minutes after Lagos midnight. */
export const minuteOf = (ms: number) => Math.floor(((ms + LAGOS_OFFSET) % DAY) / 60000);

/** The instant for a Lagos day and minute of that day. */
export const atLagos = (day: number, minute: number) => day * DAY + minute * 60000 - LAGOS_OFFSET;

export const todayDay = () => dayOf(Date.now());

/** "Sat 19 Dec" or, with the year, "Sat 19 Dec 2026". */
export function dayLabel(day: number, withYear = false) {
	const date = new Date(day * DAY);
	const label = `${weekday.format(date)} ${date.getUTCDate()} ${month.format(date)}`;
	return withYear ? `${label} ${date.getUTCFullYear()}` : label;
}

/** "7:00 PM" */
export function timeLabel(ms: number) {
	const minute = minuteOf(ms);
	const hour = Math.floor(minute / 60);
	const mins = minute % 60;
	return `${hour % 12 === 0 ? 12 : hour % 12}:${String(mins).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

/** "Sat 19 Dec 2026, 7:00 PM" */
export const fullLabel = (ms: number) => `${dayLabel(dayOf(ms), true)}, ${timeLabel(ms)}`;

/** "November 2026" for a month counted from January 1970. */
export const monthTitle = (monthIndex: number) =>
	monthLong.format(new Date(Date.UTC(1970 + Math.floor(monthIndex / 12), monthIndex % 12, 1)));

export const monthOfDay = (day: number) => {
	const date = new Date(day * DAY);
	return (date.getUTCFullYear() - 1970) * 12 + date.getUTCMonth();
};

/** The days of a month, with the Monday-first blanks before the 1st. */
export function monthGrid(monthIndex: number): (number | null)[] {
	const year = 1970 + Math.floor(monthIndex / 12);
	const monthOfYear = monthIndex % 12;
	const first = Date.UTC(year, monthOfYear, 1) / DAY;
	const length = new Date(Date.UTC(year, monthOfYear + 1, 0)).getUTCDate();
	const lead = (new Date(first * DAY).getUTCDay() + 6) % 7;
	const cells: (number | null)[] = Array.from({ length: lead }, () => null);
	for (let i = 0; i < length; i++) cells.push(first + i);
	while (cells.length % 7) cells.push(null);
	return cells;
}

/** "5 hrs 30 min" */
export function shortDuration(ms: number) {
	const total = Math.round(ms / 60000);
	const days = Math.floor(total / 1440);
	const hours = Math.floor((total % 1440) / 60);
	const minutes = total % 60;
	return [
		days && `${days} ${days === 1 ? "day" : "days"}`,
		hours && `${hours} ${hours === 1 ? "hr" : "hrs"}`,
		minutes && `${minutes} min`,
	]
		.filter(Boolean)
		.join(" ");
}

/** "4 hours 30 minutes" */
export function longDuration(ms: number) {
	const total = Math.round(ms / 60000);
	const days = Math.floor(total / 1440);
	const hours = Math.floor((total % 1440) / 60);
	const minutes = total % 60;
	return [
		days && `${days} ${days === 1 ? "day" : "days"}`,
		hours && `${hours} ${hours === 1 ? "hour" : "hours"}`,
		minutes && `${minutes} ${minutes === 1 ? "minute" : "minutes"}`,
	]
		.filter(Boolean)
		.join(" ");
}

// The server stores Go's zero time (year 0001) for cleared or unparseable dates.
export const isSetInstant = (iso?: string | null): iso is string => Boolean(iso) && !iso!.startsWith("0001-");

export const parseInstant = (iso?: string | null) => (isSetInstant(iso) ? new Date(iso).getTime() : null);

const pad = (n: number) => String(n).padStart(2, "0");

/** RFC3339 at Lagos midnight of the instant's day, for the legacy `*_date` columns. */
export function lagosDateString(ms: number) {
	const date = new Date(dayOf(ms) * DAY);
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T00:00:00+01:00`;
}

/** RFC3339 in Lagos time, e.g. "2026-12-19T22:00:00+01:00". */
export function lagosInstantString(ms: number) {
	const minute = minuteOf(ms);
	return `${lagosDateString(ms).slice(0, 10)}T${pad(Math.floor(minute / 60))}:${pad(minute % 60)}:00+01:00`;
}
