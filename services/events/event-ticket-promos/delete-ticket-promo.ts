import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = { promoId: string };

export async function production(params: Parameters): Promise<void> {
	await axios.delete(`/v1/event-ticket-promos/${params.promoId}`);
}

export async function development(): Promise<void> {
	return new Promise((resolve) => setTimeout(() => resolve(), 600));
}

export default async function deleteTicketPromo(params: Parameters): Promise<void> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
