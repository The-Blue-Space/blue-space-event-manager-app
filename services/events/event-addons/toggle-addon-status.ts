import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventTicketAddon } from "@/types/event-ticket.types";
import getEventAddon from "./get-event-addon";

type Parameters = {
	id: string;
	is_active: boolean;
};

type Response = EventTicketAddon;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.patch(`/v1/event-addons/${params.id}/status`, {
		is_active: params.is_active,
	});
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise(async (resolve) => {
		const addon = await getEventAddon({ id: params.id });
		if (!addon) {
			throw new Error("Addon not found");
		}
		setTimeout(() => {
			resolve({
				...addon,
				is_active: params.is_active,
			});
		}, 800);
	});
}

export default async function toggleAddonStatus(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
