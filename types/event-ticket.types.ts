import type { EventTicketPromo } from "./event-ticket-promo.types";
import type { Currency } from "./currency.types";

export type EventTicket = {
	id: string;
	event_id: string;
	name: string;
	description?: string;
	price: number;
	currency_id: string | null;
	ticket_promo_id?: string | null;
	total_quantity: number;
	sold_quantity: number;
	perks: string[];
	is_active: boolean;
	sales_start: string;
	sales_end?: string | null;
	expires_at?: string | null;
	created_at: string;
	updated_at: string;
	event_ticket_promo?: EventTicketPromo | null;
	currency?: Currency;
};
