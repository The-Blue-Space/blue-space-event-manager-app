import { EventTicketAddon } from "@/types/event-ticket.types";
import { BarChart2, ArrowRight } from "lucide-react";
import { getDateAndTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

type SalesDetailsProps = {
	addon: EventTicketAddon;
};

export default function SalesDetails({ addon }: SalesDetailsProps) {
	const formatDate = (date: string, time?: string | null) => {
		if (!date) return null;
		try {
			let dateObj: Date;
			if (time) {
				const [hours, minutes] = time.split(":");
				dateObj = new Date(date);
				dateObj.setHours(Number(hours), Number(minutes), 0, 0);
			} else {
				dateObj = new Date(date);
			}
			return getDateAndTime(dateObj.toISOString(), {
				dateOptions: { dateStyle: "medium" },
				timeOptions: time
					? { hour: "2-digit", minute: "2-digit", hour12: true }
					: undefined,
			});
		} catch {
			return null;
		}
	};

	const salesStart = formatDate(addon.sales_start_date, addon.sales_start_time);
	const salesEnd = addon.sales_end_date
		? formatDate(addon.sales_end_date, addon.sales_end_time || null)
		: null;

	const salesStartLabel = salesStart
		? `${salesStart.date}${salesStart.time ? ` · ${salesStart.time}` : ""}`
		: "—";
	const salesEndLabel = salesEnd
		? `${salesEnd.date}${salesEnd.time ? ` · ${salesEnd.time}` : ""}`
		: "Open-ended";

	const expiresAt = addon.expires_at
		? getDateAndTime(addon.expires_at, {
				dateOptions: { dateStyle: "medium" },
				timeOptions: { hour: "2-digit", minute: "2-digit", hour12: true },
		  })
		: null;

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<BarChart2 className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Sales Window</h3>
			</div>

			<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
				{/* Sales window timeline */}
				<div className="space-y-1.5">
					<span className="body-3 text-neutral-500">Active period</span>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="body-3 font-medium text-neutral-900">{salesStartLabel}</span>
						<ArrowRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
						<span
							className={cn(
								"body-3 font-medium",
								salesEnd ? "text-neutral-900" : "text-neutral-400 italic"
							)}
						>
							{salesEndLabel}
						</span>
					</div>
				</div>

				{/* Expires at */}
				{expiresAt && (
					<div className="flex items-center justify-between pt-2 border-t border-neutral-200">
						<span className="body-3 text-neutral-500">Expires</span>
						<span className="body-3 font-medium text-neutral-900">
							{expiresAt.date}
							{expiresAt.time ? ` · ${expiresAt.time}` : ""}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
