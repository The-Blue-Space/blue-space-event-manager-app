import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { Event } from "@/types/event.types";

type Response = Event[];

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/events/other-upcoming`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	// For development, return a subset of upcoming events as "other managers' events"
	const now = new Date();
	const upcomingEvents = events.filter((event) => {
		if (!event.event_start_date) return false;
		const startDate = new Date(event.event_start_date);
		return startDate > now && event.published;
	});

	// Return a portion as "other managers' events"
	const otherManagersEvents = upcomingEvents.slice(0, 3);

	return new Promise((resolve) => {
		setTimeout(() => resolve(otherManagersEvents), 1200);
	});
}

export default async function getOtherManagersEvents(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
