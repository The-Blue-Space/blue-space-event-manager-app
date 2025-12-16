import { variables } from "@/constants";
import axios from "@/lib/axios";

type TicketPreview = {
	id: string;
	name: string;
	type: string;
	price?: number;
	quantity?: number;
	sold: number;
};

type AddonPreview = {
	id: string;
	name: string;
	type: string;
	price?: number;
};

type PromoPreview = {
	id: string;
	code: string;
	discount_type: string;
	discount_value: number;
};

type AttendeePreview = {
	id: string;
	user_id: string;
	name: string;
	email: string;
	status: string;
	avatar?: string;
};

type EventPreview = {
	id: string;
	title: string;
	access_type: string;
	event_start_date?: string;
	location: string;
	cover_image?: string;
};

export type EventDuplicationPreview = {
	event: EventPreview;
	tickets: TicketPreview[];
	addons: AddonPreview[];
	promos: PromoPreview[];
	previous_attendees: AttendeePreview[];
};

type Parameters = {
	eventId: string;
};

type Response = EventDuplicationPreview;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.eventId}/duplicate/preview`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Mock data for development
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					event: {
						id: params.eventId,
						title: "Sample Event",
						access_type: "individual",
						event_start_date: new Date().toISOString(),
						location: "Lagos, Nigeria",
						cover_image: "https://picsum.photos/400/300",
					},
					tickets: [
						{ id: "ticket-1", name: "VIP Ticket", type: "paid", price: 5000, quantity: 100, sold: 25 },
						{ id: "ticket-2", name: "Regular Ticket", type: "paid", price: 2000, quantity: 200, sold: 50 },
					],
					addons: [
						{ id: "addon-1", name: "T-Shirt", type: "paid", price: 1500 },
						{ id: "addon-2", name: "Poster", type: "paid", price: 500 },
					],
					promos: [
						{ id: "promo-1", code: "EARLY20", discount_type: "percentage", discount_value: 20 },
					],
					previous_attendees: [
						{
							id: "attendee-1",
							user_id: "user-1",
							name: "John Doe",
							email: "john@example.com",
							status: "joined",
						},
						{
							id: "attendee-2",
							user_id: "user-2",
							name: "Jane Smith",
							email: "jane@example.com",
							status: "joined",
						},
					],
				}),
			500
		);
	});
}

export default async function getEventDuplicationPreview(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
