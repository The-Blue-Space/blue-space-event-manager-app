import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { generatePaginateResponse } from "@/lib/paginate";
import { Event, EventsFilterParams } from "@/types/event.types";
import { PaginatedResponse } from "@/types/global.types";

type Parameters = EventsFilterParams;
type Response = PaginatedResponse<Event>;

export async function production(params: Parameters): Promise<Response> {
	const query_string = buildQueryString(params);
	const response = await axios.get(`/v1/events?${query_string}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Filter events based on parameters
	let filteredEvents = [...events];

	// Search filter (title and tags)
	if (params.search) {
		const searchLower = params.search.toLowerCase();
		filteredEvents = filteredEvents.filter(
			(event) =>
				event.title.toLowerCase().includes(searchLower) ||
				event.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
		);
	}

	// Category filter
	if (params.category) {
		filteredEvents = filteredEvents.filter((event) => event.event_category_id === params.category);
	}

	// Access type filter
	if (params.access_type) {
		filteredEvents = filteredEvents.filter((event) => event.access_type === params.access_type);
	}

	// Published status filter
	if (params.published !== undefined) {
		const isPublished = params.published === "true";
		filteredEvents = filteredEvents.filter((event) => event.published === isPublished);
	}

	// Date range filter
	if (params.start_date) {
		filteredEvents = filteredEvents.filter(
			(event) =>
				event.event_start_date && new Date(event.event_start_date) >= new Date(params.start_date!)
		);
	}

	if (params.end_date) {
		filteredEvents = filteredEvents.filter(
			(event) =>
				event.event_start_date && new Date(event.event_start_date) <= new Date(params.end_date!)
		);
	}

	// Sort
	if (params.sort_by) {
		filteredEvents.sort((a, b) => {
			let aVal: any, bVal: any;

			switch (params.sort_by) {
				case "uploads":
					aVal = a.total_uploads || 0;
					bVal = b.total_uploads || 0;
					break;
				case "attendees":
					aVal = a.total_participants || 0;
					bVal = b.total_participants || 0;
					break;
				case "revenue":
					aVal = a.total_revenue || 0;
					bVal = b.total_revenue || 0;
					break;
				case "date":
					aVal = a.event_start_date ? new Date(a.event_start_date).getTime() : 0;
					bVal = b.event_start_date ? new Date(b.event_start_date).getTime() : 0;
					break;
				default:
					// Default: newest first (created_at)
					aVal = new Date(a.created_at).getTime();
					bVal = new Date(b.created_at).getTime();
			}

			if (params.sort_order === "asc") {
				return aVal > bVal ? 1 : -1;
			}
			return aVal < bVal ? 1 : -1;
		});
	} else {
		// Default sort: newest first
		filteredEvents.sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
	}

	return new Promise((resolve) => {
		setTimeout(() => resolve(generatePaginateResponse([...filteredEvents,...filteredEvents])), 800);
	});
}

export default async function getEvents(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);

	return production(params);
}
