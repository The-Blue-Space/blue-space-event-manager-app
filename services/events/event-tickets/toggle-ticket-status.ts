import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventTicket } from "@/types/event-ticket.types";
import getEventTickets from "./get-event-tickets";

type Parameters = {
	id: string;
	eventId: string;
	is_active: boolean;
};

type Response = EventTicket;

export async function production(params: Parameters): Promise<Response> {
	// Use PATCH endpoint if available, otherwise use PUT with minimal data
	const response = await axios.patch(`/v1/event-tickets/${params.id}/status`, {
		is_active: params.is_active,
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// For development, simulate the toggle by updating the ticket in constants data
	return new Promise(async (resolve) => {
		// First, get all tickets to find the one we need to update
		const tickets = await getEventTickets({ event_Id: params.eventId });
		const ticket = tickets.find((t) => t.id === params.id);

		if (!ticket) {
			throw new Error("Ticket not found");
		}

		// Simulate toggle by returning the ticket with updated status
		// In production, this would call the actual API
		setTimeout(() => {
			resolve({
				...ticket,
				is_active: params.is_active,
			});
		}, 800);
	});
}

export default async function toggleTicketStatus(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
