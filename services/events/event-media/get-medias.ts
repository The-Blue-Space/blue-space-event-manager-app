import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { EventMedia } from "@/types/event-media.types";

type Parameters = {
	event_Id: string;
};
type Response = EventMedia[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.event_Id}/media`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(events[0].event_media!), 800);
	});
}

export default async function getMedias(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
