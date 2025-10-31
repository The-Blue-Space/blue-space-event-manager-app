import type { Currency } from "./global.types";

export const EVENT_TICKET_TYPES = ["free", "paid", "donation"] as const;
export type EventTicketType = (typeof EVENT_TICKET_TYPES)[number];

export const PROMO_TYPES = ["discount", "free_ticket"] as const;
export type PromoType = (typeof PROMO_TYPES)[number];

export const DISCOUNT_TYPES = ["percentage", "fixed", "none"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type EventTicket = {
	id: string;
	event_id: string;
	type: EventTicketType;
	name: string;
	description?: string;
	price: number | null;
	currency_id: string | null;
	ticket_promo_id?: string | null;
	minimum_quantity: number;
	maximum_quantity: number | null;
	total_quantity: number;
	sold_quantity: number;
	perks: string[];
	is_active: boolean;
	sales_start_date: string;
	sales_start_time?: string | null;
	sales_end_date?: string | null;
	sales_end_time?: string | null;
	expires_at?: string | null;
	created_at: string;
	updated_at: string;
	event_ticket_promo?: EventTicketPromo | null;
	currency?: Currency;
	absolve_fee: boolean;
	unlimited_quantity: boolean;
};

export type EventTicketAddon = {
	id: string;
	ticket_ids: string[] | null; // if null, then it is a standalone addon
	name: string;
	description?: string;
	type: EventTicketType;
	price: number | null;
	currency_id: string | null;
	is_active: boolean;
	sales_start_date: string;
	sales_start_time?: string | null;
	sales_end_date?: string | null;
	sales_end_time?: string | null;
	expires_at?: string | null;
	created_at: string;
	updated_at: string;
};

export type EventTicketPromo = {
	id: string;
	ticket_id: string;
	name: string;
	description?: string;
	note?: string;
	promo_type: PromoType;

	//free_ticket
	min_purchase_quantity?: number | null;
	max_purchase_quantity?: number | null;
	free_ticket_quantity: number;
	// discount
	discount_percentage: number;
	discount_amount: number;
	discount_type?: DiscountType;
	discount_start_date?: string | null;
	discount_end_date?: string | null;

	is_active: boolean;
	sales_start_date: string;
	sales_start_time?: string | null;
	sales_end_date?: string | null;
	sales_end_time?: string | null;
	expires_at?: string | null;
	created_at: string;
	updated_at: string;
	event_ticket?: EventTicket;
};
