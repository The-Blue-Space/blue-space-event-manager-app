import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	eventId: string;
	ticketId: string;
};

type Response = {
	success: boolean;
	message: string;
};

export async function production(params: Parameters): Promise<Response> {
	const { eventId, ticketId } = params;
	const response = await axios.post(`/v1/events/${eventId}/tickets/${ticketId}/revoke`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { userTickets } = await import("@/constants/data/events/user-tickets");
	const { ticketId } = params;

	return new Promise((resolve) => {
		setTimeout(() => {
			const ticket = userTickets.find((t) => t.id === ticketId);
			if (ticket) {
				ticket.ticket_status = "failed";
			}
			resolve({
				success: true,
				message: "Ticket revoked successfully",
			});
		}, 600);
	});
}

export default async function revokeUserTicket(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
