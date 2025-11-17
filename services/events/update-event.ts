import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { Event } from "@/types/event.types";
import { DeepPartial } from "@/types/global.types";

type Parameters = DeepPartial<Event> & {
	event_id: string;
};
type Response = Event;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.patch(`/v1/events/${params.event_id}`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(events[0]), 1500);
	});
}

export default async function updateEventDetails(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
