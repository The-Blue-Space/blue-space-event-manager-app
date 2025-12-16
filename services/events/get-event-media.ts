import { variables } from "@/constants";
import axios from "@/lib/axios";
import { generatePaginateResponse } from "@/lib/paginate";
import { EventMedia } from "@/types/event-media.types";
import { PaginatedResponse } from "@/types/global.types";

type Parameters = {
	eventId: string;
	page?: number;
	limit?: number;
};

type Response = PaginatedResponse<EventMedia>;

export async function production(params: Parameters): Promise<Response> {
	const { eventId, page = 1, limit = 20 } = params;
	const response = await axios.get(`/v1/events/${eventId}/media`, {
		params: { page, limit },
	});
	return response.data;
}

export async function development(): Promise<Response> {
	const { eventMedia } = await import("@/constants/data/events/event-media");

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(generatePaginateResponse(eventMedia));
		}, 800);
	});
}

export default async function getEventMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
