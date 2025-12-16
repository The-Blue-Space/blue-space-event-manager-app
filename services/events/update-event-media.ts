import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	eventId: string;
	mediaId: string;
	isActive?: boolean;
	order?: number;
};

type Response = {
	success: boolean;
	message: string;
};

export async function production(params: Parameters): Promise<Response> {
	const { eventId, mediaId, ...data } = params;
	const response = await axios.patch(`/v1/events/${eventId}/media/${mediaId}`, data);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { eventMedia } = await import("@/constants/data/events/event-media");
	const { mediaId, isActive, order } = params;

	return new Promise((resolve) => {
		setTimeout(() => {
			const media = eventMedia.find((m) => m.id === mediaId);
			if (media) {
				if (isActive !== undefined) media.is_active = isActive;
				if (order !== undefined) media.order = order;
			}
			resolve({
				success: true,
				message: "Media updated successfully",
			});
		}, 600);
	});
}

export default async function updateEventMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
