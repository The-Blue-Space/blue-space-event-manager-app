import { variables } from "@/constants";
import { eventTickets } from "@/constants/data/events/event-tickets";
import axios from "@/lib/axios";
import { EventTicket, EventTicketType } from "@/types/event-ticket.types";

type Parameters = {
	event_id: string;
	type: EventTicketType;
	name: string;
	description?: string;
	price: number | null;
	currency_id: string | null;
	minimum_quantity: number;
	maximum_quantity: number | null;
	total_quantity: number | null;
	perks: string[];
	sales_start_date: string;
	sales_start_time: string;
	sales_end_date?: string | null;
	sales_end_time?: string | null;
	expires_at?: string | null;
	unlimited_quantity: boolean;
	absolve_fee: boolean;
};

type Response = EventTicket;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/events/${params.event_id}/event-tickets`, params);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(eventTickets[0]), 1500);
	});
}

export default async function addEventTicket(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
