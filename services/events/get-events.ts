import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { generatePaginateResponse } from "@/lib/paginate";
import { Event } from "@/types/event.types";
import { PaginatedResponse, PaginationQuery } from "@/types/global.types";

type Parameters = PaginationQuery & {};
type Response = PaginatedResponse<Event>;

export async function production(params: Parameters): Promise<Response> {
	const query_string = buildQueryString(params);
	const response = await axios.get(`/v1/events?${query_string}`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	// Mock upcoming events data

	return new Promise((resolve) => {
		setTimeout(() => resolve(generatePaginateResponse(events)), 1500);
	});
}

export default async function getEvents(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
