import { variables } from "@/constants";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { EventActivity } from "@/types/event.types";

type Parameters = {
	eventId: string;
};



type Response = EventActivity[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.eventId}/activities`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Mock activities data
	const mockActivities: EventActivity[] = [
		{
			id: "act_001",
			event_id: params.eventId,
			type: "ticket_purchase",
			action: "Ticket Purchased",
			details: "2 VIP tickets purchased",
			user: {
				...users[0],
				id: "user_001",
				name: "Sarah Johnson",
				avatar_url: "https://i.pravatar.cc/150?img=1",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
			metadata: { quantity: 2, ticket_type: "VIP", amount: 500 },
		},
		{
			id: "act_002",
			event_id: params.eventId,
			type: "check_in",
			action: "Checked In",
			details: "Attendee checked in at gate A",
			user: {
				...users[1],
				id: "user_002",
				name: "Michael Chen",
				avatar_url: "https://i.pravatar.cc/150?img=2",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
			metadata: { gate: "A" },
		},
		{
			id: "act_003",
			event_id: params.eventId,
			type: "event_update",
			action: "Event Updated",
			details: "Event description and schedule updated",
			user: {
				...users[0],
				id: "admin_001",
				name: "Admin User",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
			metadata: { fields_updated: ["description", "schedule"] },
		},
		{
			id: "act_004",
			event_id: params.eventId,
			type: "check_in",
			action: "New Registration",
			details: "Registered for the event",
			user: {
				...users[1],
				id: "user_003",
				name: "Emma Wilson",
				avatar_url: "https://i.pravatar.cc/150?img=3",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
		},
		{
			id: "act_005",
			event_id: params.eventId,
			type: "ticket_purchase",
			action: "Ticket Purchased",
			details: "1 General admission ticket purchased",
			user: {
				...users[1],
				id: "user_004",
				name: "James Brown",
				avatar_url: "https://i.pravatar.cc/150?img=4",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
			metadata: { quantity: 1, ticket_type: "General", amount: 150 },
		},
		{
			id: "act_006",
			event_id: params.eventId,
			type: "comment",
			action: "Comment Posted",
			details: "Looking forward to this event!",
			user: {
				...users[0],
				id: "user_005",
				name: "Lisa Anderson",
				avatar_url: "https://i.pravatar.cc/150?img=5",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
		},
		{
			id: "act_007",
			event_id: params.eventId,
			type: "check_in",
			action: "Checked In",
			details: "Attendee checked in at gate B",
			user: {
				...users[1],
				id: "user_006",
				name: "David Kim",
				avatar_url: "https://i.pravatar.cc/150?img=6",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
			metadata: { gate: "B" },
		},
		{
			id: "act_008",
			event_id: params.eventId,
			type: "refund",
			action: "Refund Processed",
			details: "Refund issued for 1 ticket",
			user: {
				...users[0],
				id: "user_007",
				name: "Patricia Martinez",
				avatar_url: "https://i.pravatar.cc/150?img=7",
			},
			timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
			metadata: { quantity: 1, amount: 150 },
		},
	];

	return new Promise((resolve) => {
		setTimeout(() => resolve(mockActivities), 1000);
	});
}

export default async function getEventActivities(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);

	return production(params);
}
