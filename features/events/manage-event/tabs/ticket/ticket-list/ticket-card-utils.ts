import { EventTicket } from "@/types/event-ticket.types";
import { Currency } from "@/types/global.types";

/**
 * Format ticket ID as a display-friendly ticket number
 */
export function formatTicketNumber(id: string): string {
	// Extract last 6-8 digits from ID for display
	const numMatch = id.match(/\d+/);
	if (numMatch) {
		const num = numMatch[0];
		return `#${num.slice(-6).padStart(6, "0")}`;
	}
	return `#${id.slice(-6).padStart(6, "0")}`;
}

/**
 * Format availability display text
 */
export function formatAvailability(ticket: EventTicket): string {
	if (ticket.unlimited_quantity) {
		return `Sold: ${ticket.sold_quantity} / Unlimited`;
	}
	return `Sold: ${ticket.sold_quantity} / Total: ${ticket.total_quantity}`;
}

/**
 * Get promo price display information
 */
export function getPromoPriceDisplay(ticket: EventTicket): {
	original?: number;
	promo?: number;
	currency?: Currency;
} {
	const promo = ticket.event_ticket_promo;
	const currency = ticket.currency;

	if (!promo || !currency) {
		return { currency };
	}

	// Calculate promo price based on discount type
	let promoPrice: number | null = null;

	if (promo.promo_type === "discount") {
		if (promo.discount_type === "percentage") {
			const discount = (ticket.price || 0) * (promo.discount_percentage / 100);
			promoPrice = (ticket.price || 0) - discount;
		} else if (promo.discount_type === "fixed") {
			promoPrice = (ticket.price || 0) - promo.discount_amount;
		}
	} else if (promo.promo_type === "free_ticket" && ticket.price) {
		promoPrice = ticket.price; // Will show as free
	}

	return {
		original: ticket.price || undefined,
		promo: promoPrice && promoPrice > 0 ? promoPrice : undefined,
		currency,
	};
}

/**
 * Format sales period as a readable string
 */
export function formatSalesPeriod(ticket: EventTicket): string {
	const startDate = new Date(ticket.sales_start_date);
	const startFormatted = startDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	if (!ticket.sales_end_date) {
		return `Sales: ${startFormatted} - Ongoing`;
	}

	const endDate = new Date(ticket.sales_end_date);
	const endFormatted = endDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return `Sales: ${startFormatted} - ${endFormatted}`;
}
