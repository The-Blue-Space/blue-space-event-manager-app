import { variables } from "@/constants";
import { eventAgendas } from "@/constants/data/events/event-agenda";
import axios from "@/lib/axios";
import { EventAgenda } from "@/types/event-agenda.types";

type Parameters = {
	event_Id: string;
};

type Response = EventAgenda[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.event_Id}/agenda`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		// Filter agendas for the specific event
		const eventAgenda = eventAgendas.filter((agenda) => agenda.event_id === params.event_Id);
		setTimeout(() => resolve(eventAgenda), 800);
	});
}

export default async function getAgendas(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
