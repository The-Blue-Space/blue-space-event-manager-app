import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { Event } from "@/types/event.types";

type Parameters = {
	id: string;
};
type Response = Event;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.id}`);
	return response.data;
}

export async function development(): Promise<Response> {
	// Mock upcoming events data

	return new Promise((resolve) => {
		setTimeout(() => resolve(events[0]), 1500);
	});
}

export default async function getEventDetails(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
