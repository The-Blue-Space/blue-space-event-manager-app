import { variables } from "@/constants";
import { events } from "@/constants/data/events/events";
import axios from "@/lib/axios";
import { Event } from "@/types/event.types";

export type DuplicateEventOptions = {
	include_tickets?: boolean;
	include_addons?: boolean;
	include_promos?: boolean;
	reinvite_attendees?: boolean;
	attendee_ids?: string[];
};

type Parameters = {
	eventId: string;
	options?: DuplicateEventOptions;
};

type Response = {
	message: string;
	event: Event;
	invited_count?: number;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/events/${params.eventId}/duplicate`, params.options || {});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Find the event to duplicate
	const eventToDuplicate = events.find((event) => event.id === params.eventId);

	if (!eventToDuplicate) {
		throw new Error("Event not found");
	}

	// Create a duplicated event with modified data
	const duplicatedEvent: Event = {
		...eventToDuplicate,
		id: `evt_dup_${Date.now()}`, // New ID
		title: `${eventToDuplicate.title} (Copy)`,
		is_duplicated: true,
		previous_event_id: eventToDuplicate.id,
		published: false, // Duplicates start as unpublished
		published_at: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		// Reset metrics for the duplicate
		ticket_sold: null,
		total_uploads: 0,
		total_participants: 0,
		total_revenue: null,
		total_refunds: null,
	};

	const invitedCount = params.options?.reinvite_attendees ? (params.options?.attendee_ids?.length || 0) : 0;

	return new Promise((resolve) => {
		setTimeout(() => resolve({
			message: "Event duplicated successfully",
			event: duplicatedEvent,
			invited_count: invitedCount,
		}), 1000);
	});
}

export default async function duplicateEvent(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);

	return production(params);
}
