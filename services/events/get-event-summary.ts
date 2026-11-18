import { variables } from "@/constants";
import axios from "@/lib/axios";
import { EventSummary } from "@/types/event-summary.types";

export async function production(eventId: string): Promise<EventSummary> {
	const response = await axios.get<{ data: EventSummary }>(`/v1/events/${eventId}/summary`);
	return response.data.data;
}

// A fresh draft, matching the "new draft" board in the design file.
export async function development(eventId: string): Promise<EventSummary> {
	const summary: EventSummary = {
		event: {
			id: eventId,
			title: "Rooftop Sessions Vol. 4",
			description: "Live sets on the roof at sunset, then DJs until late.",
			category: "Music & Concerts",
			status: "draft",
			published: false,
			published_at: null,
			scheduled_publish_at: null,
			access_type: "ticket-based",
			is_private: false,
			starts_at: null,
			ends_at: null,
			doors_open_at: null,
			venue_name: null,
			address: null,
			city: null,
			cover_url: null,
			capacity: null,
		},
		setup: { has_schedule: false, has_venue: false, has_cover: false, ticket_types: 0, active_ticket_types: 0 },
		sales: { tickets_sold: 0, revenue_kobo: 0, checked_in: 0, tiers: [] },
		photos: { count: 0, recent: [] },
		recent_orders: [],
		refund_policy: { type: "partial-refund", days: 7, inherited: true },
	};
	return new Promise((resolve) => setTimeout(() => resolve(summary), 500));
}

export default async function getEventSummary(eventId: string): Promise<EventSummary> {
	if (variables.SERVICE_ENV === "development") return development(eventId);
	return production(eventId);
}
