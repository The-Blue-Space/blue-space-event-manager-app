import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { Event } from "@/types/event.types";

type Parameters = {
	event_id: string;
};

type Response = Event;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.put(`/v1/events/${params.event_id}/unpublish`);
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const event = events.find((e) => e.id === params.event_id);
		if (!event) {
			throw new Error("Event not found");
		}

		const updated: Event = {
			...event,
			published: false,
			published_at: null,
		};

		setTimeout(() => resolve(updated), 800);
	});
}

export default async function unpublishEvent(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
