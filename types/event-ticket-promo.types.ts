import type { EventTicket } from "./event-ticket.types";

export type PromoType = "discount" | "free_ticket";

export type DiscountType = "percentage" | "fixed" | "none";

export type EventTicketPromo = {
	id: string;
	ticket_id: string;
	name: string;
	description?: string;
	note?: string;
	promo_type?: PromoType;
	min_purchase_quantity?: number | null;
	max_purchase_quantity?: number | null;
	free_ticket_quantity: number;
	discount_percentage: number;
	discount_amount: number;
	discount_type?: DiscountType;
	discount_start_date?: string | null;
	discount_end_date?: string | null;
	is_active: boolean;
	sales_start: string;
	sales_end?: string | null;
	expires_at?: string | null;
	created_at: string;
	updated_at: string;
	event_ticket?: EventTicket;
};
