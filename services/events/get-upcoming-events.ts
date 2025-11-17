import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { Event } from "@/types/event.types";

type Response = Event[];
type Parameters = {
	managerId?: string;
};

export async function production(params: Parameters): Promise<Response> {
	const query_string = buildQueryString(params);
	const response = await axios.get(`/v1/events/upcoming?${query_string}`);
	return response.data;
}

export async function development(): Promise<Response> {
	const upcomingEvents = events;
	return new Promise((resolve) => {
		setTimeout(() => resolve(upcomingEvents), 1000);
	});
}

export default async function getUpcomingEvents(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
