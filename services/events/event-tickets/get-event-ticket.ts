import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventTicket } from "@/types/event-ticket.types";
import { eventTickets } from "@/constants/data/events/event-tickets";

type Parameters = {
	id: string;
};

type Response = EventTicket;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/event-tickets/${params.id}`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(eventTickets[0]), 1000);
	});
}

export default async function getEventTicket(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
