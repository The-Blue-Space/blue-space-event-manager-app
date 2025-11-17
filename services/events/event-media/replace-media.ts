import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { EventMedia } from "@/types/event-media.types";

type Parameters = {
	event_Id: string;
	media_id: string;
	file: File;
};
type Response = EventMedia;

export async function production(params: Parameters): Promise<Response> {
	// /events/:event_id/media
	const formData = buildFormData({
		file: params.file,
	});
	const response = await axios.put(
		`/v1/events/${params.event_Id}/media/${params.media_id}`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(events[0].event_media![0]), 1500);
	});
}

export default async function replaceMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
