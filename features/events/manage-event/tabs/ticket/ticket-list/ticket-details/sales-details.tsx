import { EventTicket } from "@/types/event-ticket.types";
import { BarChart2, ArrowRight, Infinity } from "lucide-react";
import { getDateAndTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

type SalesDetailsProps = {
	ticket: EventTicket;
};

export default function SalesDetails({ ticket }: SalesDetailsProps) {
	const formatSalesDate = (date: string, time?: string | null) => {
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

	const salesStart = formatSalesDate(ticket.sales_start_date, ticket.sales_start_time);
	const salesEnd = ticket.sales_end_date
		? formatSalesDate(ticket.sales_end_date, ticket.sales_end_time || null)
		: null;

	const salesStartLabel = salesStart
		? `${salesStart.date}${salesStart.time ? ` · ${salesStart.time}` : ""}`
		: "—";
	const salesEndLabel = salesEnd
		? `${salesEnd.date}${salesEnd.time ? ` · ${salesEnd.time}` : ""}`
		: "Open-ended";

	// Capacity
	const soldQty = ticket.sold_quantity ?? 0;
	const totalQty = ticket.total_quantity;
	const isUnlimited = ticket.unlimited_quantity;
	const soldPct =
		!isUnlimited && totalQty
			? Math.min(100, Math.round((soldQty / totalQty) * 100))
			: 0;

	const capacityColor =
		soldPct >= 90
			? "bg-error-500"
			: soldPct >= 70
			? "bg-yellow-500"
			: "bg-success-500";

	const expiresAt = ticket.expires_at
		? getDateAndTime(ticket.expires_at, {
				dateOptions: { dateStyle: "medium" },
				timeOptions: { hour: "2-digit", minute: "2-digit", hour12: true },
		  })
		: null;

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<BarChart2 className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Sales & Capacity</h3>
			</div>

			<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
				{/* ── Capacity bar ── */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="body-3 text-neutral-500">Capacity sold</span>
						{isUnlimited ? (
							<span className="inline-flex items-center gap-1 body-3 font-medium text-blue-600">
								<Infinity className="w-3.5 h-3.5" />
								{soldQty} sold · Unlimited
							</span>
						) : (
							<span className="body-3 font-medium text-neutral-900">
								{soldQty} / {totalQty ?? "—"}
								<span className="text-neutral-400 ml-1.5">({soldPct}%)</span>
							</span>
						)}
					</div>
					{!isUnlimited && (
						<div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
							<div
								className={cn("h-full rounded-full transition-all duration-500", capacityColor)}
								style={{ width: `${soldPct}%` }}
							/>
						</div>
					)}
				</div>

				{/* ── Purchase limits ── */}
				{(ticket.minimum_quantity > 0 || ticket.maximum_quantity) && (
					<div className="flex items-center justify-between pt-1 border-t border-neutral-200">
						<span className="body-3 text-neutral-500">Purchase limits</span>
						<span className="body-3 font-medium text-neutral-900">
							{ticket.minimum_quantity > 0 ? `${ticket.minimum_quantity} min` : ""}
							{ticket.minimum_quantity > 0 && ticket.maximum_quantity ? " · " : ""}
							{ticket.maximum_quantity ? `${ticket.maximum_quantity} max` : ""}
						</span>
					</div>
				)}

				{/* ── Sales window ── */}
				<div className="pt-1 border-t border-neutral-200 space-y-1.5">
					<span className="body-3 text-neutral-500">Sales window</span>
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

				{/* ── Expires at ── */}
				{expiresAt && (
					<div className="flex items-center justify-between pt-1 border-t border-neutral-200">
						<span className="body-3 text-neutral-500">Ticket expires</span>
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
