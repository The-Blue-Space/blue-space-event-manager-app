import { variables } from "@/constants";
import { eventAddons } from "@/constants/data/events/event-addons";
import axios from "@/lib/axios";
import { EventTicketAddon } from "@/types/event-ticket.types";

type Parameters = {
	id: string;
};

type Response = EventTicketAddon | null;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/event-addons/${params.id}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const addon = eventAddons.find((a) => a.id === params.id);
		setTimeout(() => resolve(addon || null), 800);
	});
}

export default async function getEventAddon(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
