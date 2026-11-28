import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { AccessType, Event } from "@/types/event.types";

// The manager profile comes from the X-Manager-ID header, so it isn't part of the body.
type Parameters = {
	is_private: boolean;
	title: string;
	description: string;
	location_id?: string;
	access_type: AccessType;
	event_category_id: string;
	tags?: string[];
};
type Response = { event: Event };

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post<{ data: Event }>(`/v1/events`, params);
	return { event: response.data.data };
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ event: events[0] }), 1500);
	});
}

export default async function createEvent(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
