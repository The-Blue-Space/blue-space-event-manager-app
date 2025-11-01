import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventTicketAddon } from "@/types/event-ticket.types";

type Parameters = {
	id: string;
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
	const response = await axios.put(`/v1/event-addons/${params.id}`, params);
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const updated: EventTicketAddon = {
			id: params.id,
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
		setTimeout(() => resolve(updated), 900);
	});
}

export default async function updateEventAddon(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
