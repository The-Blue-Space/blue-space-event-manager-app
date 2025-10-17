import { UserTicket } from "@/types/user-ticket.types";
import { users } from "./user";
import { eventTickets } from "./events/event-tickets";
import { eventTicketPromos } from "./events/event-ticket-promo";
import { orders } from "./orders";

export const userTickets: UserTicket[] = [
	{
		id: "1",
		user_id: "1",
		ticket_id: "1",
		ticket_promo_id: "1",
		is_used: true,
		used_at: null,
		qr_code: "1234567890",
		ticket_code: "1234567890",
		ticket_status: "paid",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		user: users[0],
		ticket: eventTickets[0],
		ticket_promo: eventTicketPromos[0],
		ticket_payment: orders[0],
	},
	{
		id: "2",
		user_id: "2",
		ticket_id: "2",
		ticket_promo_id: "2",
		is_used: false,
		used_at: null,
		qr_code: "1234567890",
		ticket_code: "1234567890",
		ticket_status: "pending",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		user: users[1],
		ticket: eventTickets[1],
		ticket_promo: eventTicketPromos[1],
	},
];
