import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { EventMedia, EventMediaType } from "@/types/event-media.types";

// NOTE: this for updating the media order, is_active status, and media_type (not the media file itself)
type Parameters = {
	event_Id: string;
	media_id: string;
	is_active: boolean;
	order: number;
	media_type?: EventMediaType;
	user_id: string;
};

type Response = EventMedia;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.put(
		`/v1/events/${params.event_Id}/media/${params.media_id}`,
		params
	);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(events[0].event_media![0]), 1000);
	});
}

export default async function updateMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
