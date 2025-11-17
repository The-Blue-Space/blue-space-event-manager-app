import { variables } from "@/constants";
import { eventLineups } from "@/constants/data/events/event-lineup";
import axios from "@/lib/axios";
import { EventLineup } from "@/types/event-agenda.types";

type Parameters = {
	eventId: string;
};

type Response = EventLineup[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.eventId}/lineup`);
	return response.data;
}

export async function development(): Promise<Response> {
	// Filter lineups by event ID
	const lineups = eventLineups;

	// Sort by order
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(lineups.sort((a, b) => a.order - b.order));
		}, 800);
	});
}

export default async function getLineups(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
