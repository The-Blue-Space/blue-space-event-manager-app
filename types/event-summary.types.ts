import { HomeOrder } from "./home.types";

// Shape of GET /v1/events/:id/summary. Money is integer kobo; instants are RFC3339 or null.

export type EventStatus = "draft" | "scheduled" | "on_sale" | "live" | "ended";
export type EventAccessType = "general" | "individual" | "ticket-based" | "none";

export type EventSummaryTier = {
	id: string;
	name: string;
	price_kobo: number | null;
	sold: number;
	total: number | null;
	active: boolean;
};

export type EventSummary = {
	event: {
		id: string;
		title: string;
		description: string | null;
		category: string | null;
		status: EventStatus;
		published: boolean;
		published_at: string | null;
		scheduled_publish_at: string | null;
		access_type: EventAccessType;
		is_private: boolean;
		starts_at: string | null;
		ends_at: string | null;
		doors_open_at: string | null;
		venue_name: string | null;
		address: string | null;
		city: string | null;
		cover_url: string | null;
		capacity: number | null;
	};
	setup: { has_schedule: boolean; has_venue: boolean; has_cover: boolean; ticket_types: number; active_ticket_types: number };
	sales: { tickets_sold: number; revenue_kobo: number; checked_in: number; tiers: EventSummaryTier[] };
	photos: { count: number; recent: { id: string; url: string }[] };
	recent_orders: HomeOrder[];
	refund_policy: { type: "no-refund" | "partial-refund" | "full-refund" | null; days: number | null; inherited: boolean };
};
