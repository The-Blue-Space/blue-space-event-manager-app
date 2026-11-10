"use client";
import * as React from "react";
import classNames from "classnames";
import { HomeDashboard } from "@/types/home.types";
import { formatShortDate, plural } from "./format";

type Day = HomeDashboard["daily_tickets"][number];

// Round the axis up to a friendly number so gridlines land on whole values.
const axisMax = (max: number) => (max <= 5 ? 5 : Math.ceil(max / 10) * 10);

// Dates arrive as YYYY-MM-DD (Lagos calendar days); midday UTC keeps them on the same day when formatted.
const dayLabel = (day: Day, isToday: boolean) => (isToday ? "Today" : formatShortDate(`${day.date}T12:00:00Z`));

export default function SalesChart({ days }: { days: Day[] }) {
	const [hovered, setHovered] = React.useState<number | null>(null);
	if (!days.length) return null;

	const top = axisMax(Math.max(...days.map((day) => day.value)));
	const last = days.length - 1;
	const shown = hovered ?? last;
	const middle = Math.floor(last / 2);

	return (
		<section aria-labelledby="sales-chart" className="grid gap-3.5">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<h2 id="sales-chart" className="text-[15px] font-bold text-auth-ink">
					Tickets sold each day
				</h2>
				<p className="text-[13px] text-auth-muted">Last 30 days</p>
			</div>
			<p aria-hidden="true" className="text-[14px] tabular-nums text-auth-ink">
				<strong>{dayLabel(days[shown], shown === last)}</strong> · {plural(days[shown].value, "ticket")}
			</p>

			<div aria-hidden="true" className="flex gap-2.5">
				<div className="flex h-[168px] w-6 flex-col justify-between text-right text-[12px] leading-none tabular-nums text-auth-placeholder">
					<span>{top}</span>
					<span>{top / 2}</span>
					<span>0</span>
				</div>
				<div className="grid min-w-0 flex-1 gap-2">
					<div onMouseLeave={() => setHovered(null)} className="relative flex h-[168px] items-end gap-[3px] border-b border-auth-field sm:gap-1">
						<span className="absolute inset-x-0 top-0 border-t border-dashed border-auth-info-soft" />
						<span className="absolute inset-x-0 top-1/2 border-t border-dashed border-auth-info-soft" />
						{days.map((day, index) => (
							<div key={day.date} onMouseEnter={() => setHovered(index)} className="flex h-full flex-1 items-end">
								<div
									className={classNames(
										"min-h-[2px] w-full rounded-t-[4px] transition-colors duration-150",
										index === shown ? "bg-primary-500" : "bg-auth-link/55"
									)}
									style={{ height: `${(day.value / top) * 100}%` }}
								/>
							</div>
						))}
					</div>
					<div className="flex justify-between text-[12px] text-auth-placeholder">
						<span>{dayLabel(days[0], false)}</span>
						<span>{dayLabel(days[middle], false)}</span>
						<span>Today</span>
					</div>
				</div>
			</div>

			<table className="sr-only">
				<caption>Tickets sold each day over the last 30 days</caption>
				<thead>
					<tr>
						<th scope="col">Day</th>
						<th scope="col">Tickets</th>
					</tr>
				</thead>
				<tbody>
					{days.map((day, index) => (
						<tr key={day.date}>
							<td>{dayLabel(day, index === last)}</td>
							<td>{day.value}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
