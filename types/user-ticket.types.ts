import type { User } from "./user.types";
import type { EventTicket, EventTicketAddon, EventTicketPromo } from "./event-ticket.types";
import type { Order } from "./order.types";

export type TicketStatus = "pending" | "paid" | "failed";

export type UserTicket = {
	id: string;
	user_id: string;
	ticket_id: string;
	ticket_promo_id?: string | null;
	is_used: boolean;
	used_at?: string | null;
	qr_code?: string;
	ticket_code?: string;
	ticket_status: TicketStatus;
	created_at: string;
	updated_at: string;
	user?: User;
	ticket?: EventTicket;
	ticket_promo?: EventTicketPromo;
	ticket_addons?: EventTicketAddon[];
	ticket_payment?: Order;
};
