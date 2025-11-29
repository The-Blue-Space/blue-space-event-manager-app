import { variables } from "@/constants";
import axios from "@/lib/axios";
import { DiscountType, EventTicketPromo, PromoType } from "@/types/event-ticket.types";

type Parameters = {
	ticket_id: string;
	promo_type: PromoType;

	name: string;
	description?: string;
	note?: string;

	min_purchase_quantity?: number | null;
	max_purchase_quantity?: number | null;

	free_ticket_quantity?: number | null;
	discount_percentage?: number | null;
	discount_amount?: number | null;
	discount_type?: DiscountType;
	discount_start_date?: string | null;
	discount_end_date?: string | null;

	is_active: boolean;
	sales_start_date: string;
	sales_start_time?: string | null;
	sales_end_date?: string | null;
	sales_end_time?: string | null;
	expires_at?: string | null;
};

type Response = EventTicketPromo;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/event-ticket-promos`, params);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({} as any), 900);
	});
}

export default async function addTicketPromo(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
