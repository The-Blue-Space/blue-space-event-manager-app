import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { AccessType, Event } from "@/types/event.types";

type Parameters = {
	manager_id: string;
	is_private: boolean;
	title: string;
	description: string;
	location_id: string;
	access_type: AccessType;
	event_category_id: string;
	tags: string[];
};
type Response = {
	event: Event;
	message: string;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/events`, params);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ event: events[0], message: "Event created successfully" }), 1500);
	});
}

export default async function createEvent(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
