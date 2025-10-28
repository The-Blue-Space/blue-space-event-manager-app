import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { EventMedia, EventMediaType } from "@/types/event-media.types";

type Parameters = {
	event_Id: string;
	media_type: EventMediaType;
	file: File;
	is_active: boolean;
	order: number;
};
type Response = EventMedia;

export async function production(params: Parameters): Promise<Response> {
	const formData = buildFormData({
		file: params.file,
		is_active: params.is_active,
		order: params.order,
		media_type: params.media_type,
	});
	// /events/:event_id/media
	const response = await axios.post(`/v1/events/${params.event_Id}/media`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(events[0].event_media![0]), 1500);
	});
}

export default async function addMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
