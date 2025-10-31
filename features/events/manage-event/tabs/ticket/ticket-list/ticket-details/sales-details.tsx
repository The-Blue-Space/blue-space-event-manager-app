import { EventTicket } from "@/types/event-ticket.types";
import { Calendar } from "lucide-react";
import { getDateAndTime } from "@/lib/format-date";

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
				dateOptions: {
					dateStyle: "medium",
				},
				timeOptions: time
					? {
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
					  }
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

	const formatQuantity = (ticket: EventTicket) => {
		if (ticket.unlimited_quantity) {
			return `${ticket.sold_quantity} / Unlimited`;
		}
		return `${ticket.sold_quantity} / ${ticket.total_quantity}`;
	};

	const info: Record<string, string | undefined> = {
		quantity_sold: formatQuantity(ticket),
		minimum_quantity: ticket.minimum_quantity > 0 ? ticket.minimum_quantity.toString() : undefined,
		maximum_quantity:
			ticket.maximum_quantity !== null && ticket.maximum_quantity !== undefined
				? ticket.maximum_quantity.toString()
				: undefined,
		unlimited_quantity: ticket.unlimited_quantity ? "Yes" : "No",
		sales_start_date: salesStart
			? `${salesStart.date}${salesStart.time ? ` ${salesStart.time}` : ""}`
			: undefined,
		sales_end_date: salesEnd
			? `${salesEnd.date}${salesEnd.time ? ` ${salesEnd.time}` : ""}`
			: "Not set",
		expires_at: ticket.expires_at
			? getDateAndTime(ticket.expires_at, {
					dateOptions: { dateStyle: "medium" },
					timeOptions: { hour: "2-digit", minute: "2-digit", hour12: true },
			  }).date +
			  " " +
			  getDateAndTime(ticket.expires_at, {
					dateOptions: { dateStyle: "medium" },
					timeOptions: { hour: "2-digit", minute: "2-digit", hour12: true },
			  }).time
			: undefined,
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Calendar className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Sales Details</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{Object.entries(info)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="body-3 text-neutral-600 capitalize">{key.split("_").join(" ")}</span>
							<span className="body-3 font-medium text-neutral-900 max-w-[60%] text-right break-words">
								{value}
							</span>
						</div>
					))}
			</div>
		</div>
	);
}
