import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventTicketPromo } from "@/types/event-ticket.types";
import { eventTickets } from "@/constants/data/events/event-tickets";

type Parameters = { ticketId: string };
type Response = EventTicketPromo | null;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/event-tickets/${params.ticketId}/promo`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const ticket = eventTickets.find((t) => t.id === params.ticketId);
		setTimeout(() => resolve(ticket?.event_ticket_promo || null), 800);
	});
}

export default async function getTicketPromo(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
