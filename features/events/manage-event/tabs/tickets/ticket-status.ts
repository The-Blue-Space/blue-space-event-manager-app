import { EventTicket } from "@/types/event-ticket.types";
import { dayMonth, instant, nairaFromKobo, shortWhen } from "./format";
import { EventTimes, readWindow } from "./sales-window";
import { PillTone } from "./ui";

export type TicketStatus = { label: string; tone: PillTone; detail: string };

/** The ticket's total, or null when it has no limit. */
export const totalOf = (ticket: EventTicket) => (ticket.unlimited_quantity ? null : (ticket.total_quantity ?? null));

/** What guests can do with this ticket type right now. */
export function ticketStatus(ticket: EventTicket, sold: number, times: EventTimes, now = Date.now()): TicketStatus {
	if (!ticket.is_active) return { label: "Off", tone: "off", detail: "Guests can’t buy it." };

	const window = readWindow(ticket, times);
	const start = instant(ticket.sales_start_date);
	const end = instant(ticket.sales_end_date);

	if (!times.published) {
		const opens =
			window.startMode === "now" || start === null
				? "Goes on sale when you publish."
				: `Goes on sale ${shortWhen(start)}.`;
		const closes =
			window.endMode === "start"
				? "Sales end when the event starts."
				: window.endMode === "end"
					? "Sales end when the event ends."
					: end !== null
						? `Sales end ${shortWhen(end)}.`
						: "";
		return { label: "Ready", tone: "neutral", detail: `${opens} ${closes}`.trim() };
	}

	const total = totalOf(ticket);
	const ended = end !== null && end <= now;
	if (total !== null && sold >= total) {
		return { label: "Sold out", tone: "neutral", detail: ended ? `Sales ended ${dayMonth(end)}` : `All ${total} sold` };
	}
	if (ended) return { label: "Ended", tone: "off", detail: `Sales ended ${dayMonth(end)}` };
	if (start !== null && start > now)
		return { label: "Ready", tone: "neutral", detail: `On sale from ${shortWhen(start)}` };
	return { label: "On sale", tone: "success", detail: end !== null ? `Until ${shortWhen(end)}` : "No end date" };
}

/** "Free", "Donation" or "₦12,000". */
export function priceLabel(ticket: { type: EventTicket["type"]; price: number | null }) {
	if (ticket.type === "free") return "Free";
	if (ticket.type === "donation") return "Donation";
	return nairaFromKobo(ticket.price ?? 0);
}

/** "Fee from your price · Up to 4 per order" */
export function ticketSub(ticket: EventTicket) {
	const first =
		ticket.type === "free"
			? "Free"
			: ticket.type === "donation"
				? "Guests choose the amount"
				: ticket.absolve_fee
					? "Fee from your price"
					: "Fee added for guests";
	return [first, ticket.maximum_quantity ? `Up to ${ticket.maximum_quantity} per order` : null]
		.filter(Boolean)
		.join(" · ");
}
