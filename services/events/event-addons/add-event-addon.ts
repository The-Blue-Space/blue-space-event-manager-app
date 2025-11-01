import { variables } from "@/constants";
import { eventAddons } from "@/constants/data/events/event-addons";
import axios from "@/lib/axios";
import { EventTicketAddon } from "@/types/event-ticket.types";

type Parameters = {
	event_id: string;
	type: EventTicketAddon["type"];
	name: string;
	description?: string;
	price: number | null;
	currency_id: string | null;
	ticket_ids: string[] | null;
	sales_start_date: string;
	sales_start_time?: string | null;
	sales_end_date?: string | null;
	sales_end_time?: string | null;
	expires_at?: string | null;
	is_active: boolean;
};

type Response = EventTicketAddon;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/events/${params.event_id}/event-addons`, params);
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const newAddon: EventTicketAddon = {
			id: `addon_${Date.now()}`,
			ticket_ids: params.ticket_ids,
			name: params.name,
			description: params.description,
			type: params.type,
			price: params.price,
			currency_id: params.currency_id,
			is_active: params.is_active,
			sales_start_date: params.sales_start_date,
			sales_start_time: params.sales_start_time || null,
			sales_end_date: params.sales_end_date || null,
			sales_end_time: params.sales_end_time || null,
			expires_at: params.expires_at || null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setTimeout(() => resolve(newAddon), 900);
	});
}

export default async function addEventAddon(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
