import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventTicketPromo } from "@/types/event-ticket.types";

type Parameters = { eventId: string };

type Response = EventTicketPromo[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/event-ticket-promos/event/${params.eventId}`);
	return response.data ?? [];
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => setTimeout(() => resolve([]), 600));
}

/** Every discount on the event's ticket types. */
export default async function getEventTicketPromos(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
