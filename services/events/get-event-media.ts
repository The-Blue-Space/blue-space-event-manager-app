import { variables } from "@/constants";
import axios from "@/lib/axios";
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

export async function development(params: Parameters): Promise<Response> {
	const { eventMedia } = await import("@/constants/data/events/event-media");
	const { page = 1, limit = 20 } = params;

	return new Promise((resolve) => {
		setTimeout(() => {
			const start = (page - 1) * limit;
			const end = start + limit;
			const paginatedMedia = eventMedia.slice(start, end);

			resolve({
				docs: paginatedMedia,
				totalDocs: eventMedia.length,
				limit,
				page,
				totalPages: Math.ceil(eventMedia.length / limit),
				hasNextPage: page < Math.ceil(eventMedia.length / limit),
				hasPrevPage: page > 1,
				nextPage: page < Math.ceil(eventMedia.length / limit) ? page + 1 : null,
				prevPage: page > 1 ? page - 1 : null,
				pagingCounter: start + 1,
			});
		}, 800);
	});
}

export default async function getEventMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
