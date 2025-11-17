import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { Event } from "@/types/event.types";

type Response = Event[];

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/events/active`);
	return response.data;
}

export async function development(): Promise<Response> {
	const activeEvents = events.slice(0, 3);

	return new Promise((resolve) => {
		setTimeout(() => resolve(activeEvents), 1000);
	});
}

export default async function getActiveEvents(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
