import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { EventsOverview } from "@/types/event.types";

type Response = EventsOverview;

export async function production(): Promise<Response> {
	const response = await axios.get("/v1/events/overview");
	return response.data;
}

export async function development(): Promise<Response> {
	// Calculate overview metrics from events data
	const totalEvents = events.length;
	const publishedEvents = events.filter((event) => event.published).length;
	const unpublishedEvents = totalEvents - publishedEvents;
	const totalRevenue = events.reduce((sum, event) => sum + (event.total_revenue || 0), 0);

	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					total_events: totalEvents,
					published_events: publishedEvents,
					unpublished_events: unpublishedEvents,
					total_revenue: totalRevenue,
				}),
			800
		);
	});
}

export default async function getEventsOverview(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
