import { variables } from "@/constants";
import axios from "@/lib/axios";
import { UserTicket } from "@/types/user-ticket.types";
import { PaginatedResponse } from "@/types/global.types";

type Parameters = {
	eventId: string;
	page?: number;
	limit?: number;
	search?: string;
};

type Response = PaginatedResponse<UserTicket>;

export async function production(params: Parameters): Promise<Response> {
	const { eventId, page = 1, limit = 10, search } = params;
	const response = await axios.get(`/v1/events/${eventId}/tickets`, {
		params: { page, limit, search },
	});
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { userTickets } = await import("@/constants/data/events/user-tickets");
	const { page = 1, limit = 10, search } = params;

	return new Promise((resolve) => {
		setTimeout(() => {
			// Filter by search query if provided
			let filteredTickets = userTickets;
			if (search) {
				const query = search.toLowerCase();
				filteredTickets = userTickets.filter((ticket) => {
					const ticketCode = ticket.ticket_code?.toLowerCase() || "";
					const userName = ticket.user?.name.toLowerCase() || "";
					const userEmail = ticket.user?.email.toLowerCase() || "";
					return (
						ticketCode.includes(query) || userName.includes(query) || userEmail.includes(query)
					);
				});
			}

			const start = (page - 1) * limit;
			const end = start + limit;
			const paginatedTickets = filteredTickets.slice(start, end);

			resolve({
				docs: paginatedTickets,
				totalDocs: filteredTickets.length,
				limit,
				page,
				totalPages: Math.ceil(filteredTickets.length / limit),
				hasNextPage: page < Math.ceil(filteredTickets.length / limit),
				hasPrevPage: page > 1,
				nextPage: page < Math.ceil(filteredTickets.length / limit) ? page + 1 : null,
				prevPage: page > 1 ? page - 1 : null,
				pagingCounter: start + 1,
			});
		}, 800);
	});
}

export default async function getEventUserTickets(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
