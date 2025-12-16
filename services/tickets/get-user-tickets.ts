import { variables } from "@/constants";
import { userTickets } from "@/constants/data/user-ticket";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { generatePaginateResponse } from "@/lib/paginate";
import { PaginatedResponse, PaginationQuery } from "@/types/global.types";
import { UserTicket } from "@/types/user-ticket.types";

type Parameters = PaginationQuery & {};

type Response = PaginatedResponse<UserTicket>;

export async function production(params: Parameters): Promise<Response> {
	const query_string = buildQueryString(params);
	const response = await axios.get(`/v1/user-tickets?${query_string}`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(generatePaginateResponse(userTickets)), 1500);
	});
}

export default async function getUserTickets(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
