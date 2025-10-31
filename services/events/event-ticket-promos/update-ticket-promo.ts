import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventTicketPromo } from "@/types/event-ticket.types";

type Parameters = {
	promoId: string;
	ticket_id: string;
	promo_type: "discount" | "free_ticket";
	payload: Record<string, any>;
};

type Response = EventTicketPromo;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.put(`/v1/event-ticket-promos/${params.promoId}`, params);
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const updated: EventTicketPromo = {
			id: params.promoId,
			ticket_id: params.ticket_id,
			name: params.payload.name || "Updated Promo",
			description: params.payload.description,
			note: params.payload.note,
			promo_type: params.promo_type,
			min_purchase_quantity: params.payload.min_purchase_quantity || null,
			max_purchase_quantity: params.payload.max_purchase_quantity || null,
			free_ticket_quantity:
				params.promo_type === "free_ticket" ? Number(params.payload.free_ticket_quantity || 1) : 0,
			discount_percentage:
				params.promo_type === "discount" ? Number(params.payload.discount_percentage || 0) : 0,
			discount_amount:
				params.promo_type === "discount" ? Number(params.payload.discount_amount || 0) : 0,
			discount_type: params.promo_type === "discount" ? params.payload.discount_type : undefined,
			is_active: true,
			sales_start_date: params.payload.sales_start_date || new Date().toISOString(),
			sales_start_time: params.payload.sales_start_time || null,
			sales_end_date: params.payload.sales_end_date || null,
			sales_end_time: params.payload.sales_end_time || null,
			expires_at: params.payload.expires_at || null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setTimeout(() => resolve(updated), 900);
	});
}

export default async function updateTicketPromo(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
