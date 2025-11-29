import { variables } from "@/constants";
import { eventAddons } from "@/constants/data/events/event-addons";
import axios from "@/lib/axios";
import { EventTicketAddon } from "@/types/event-ticket.types";

type Parameters = {
	event_Id: string;
};

type Response = EventTicketAddon[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.event_Id}/event-addons`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		// Filter addons by event_id (for now, return all as they're for different events)
		setTimeout(() => resolve(eventAddons), 800);
	});
}

export default async function getEventAddons(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
