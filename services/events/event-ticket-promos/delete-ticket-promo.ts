import { variables } from "@/constants";
import axios from "@/lib/axios";

// The server reads who is asking from the body here, and only adds it to POST, PUT and PATCH bodies itself.
type Parameters = { promoId: string; userId: string };

export async function production(params: Parameters): Promise<void> {
	await axios.delete(`/v1/event-ticket-promos/${params.promoId}`, { data: { user_id: params.userId } });
}

export async function development(): Promise<void> {
	return new Promise((resolve) => setTimeout(() => resolve(), 600));
}

export default async function deleteTicketPromo(params: Parameters): Promise<void> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
