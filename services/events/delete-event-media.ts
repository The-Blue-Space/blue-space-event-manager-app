import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	eventId: string;
	mediaIds: string[];
};

type Response = {
	success: boolean;
	message: string;
};

export async function production(params: Parameters): Promise<Response> {
	const { eventId, mediaIds } = params;
	const response = await axios.delete(`/v1/events/${eventId}/media`, {
		data: { mediaIds },
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { eventMedia } = await import("@/constants/data/events/event-media");
	const { mediaIds } = params;

	return new Promise((resolve) => {
		setTimeout(() => {
			mediaIds.forEach((id) => {
				const index = eventMedia.findIndex((m) => m.id === id);
				if (index !== -1) {
					eventMedia.splice(index, 1);
				}
			});
			resolve({
				success: true,
				message: "Media deleted successfully",
			});
		}, 600);
	});
}

export default async function deleteEventMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
