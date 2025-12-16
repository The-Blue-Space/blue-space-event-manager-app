import { variables } from "@/constants";
import { eventTickets } from "@/constants/data/events/event-tickets";
import axios from "@/lib/axios";
import { EventTicket } from "@/types/event-ticket.types";

type Parameters = {
	event_Id: string;
};

type Response = EventTicket[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.event_Id}/event-tickets`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(eventTickets), 800);
	});
}

export default async function getEventTickets(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
