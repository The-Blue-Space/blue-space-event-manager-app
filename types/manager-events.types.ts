import { EventAccessType, EventStatus, EventSummary } from "./event-summary.types";

// Shape of GET /v1/manager/events. Instants are RFC3339 or null.

export type EventsView = "all" | "upcoming" | "drafts" | "past";

export type ManagerEvent = {
	id: string;
	title: string;
	venue_name: string | null;
	address: string | null;
	city: string | null;
	starts_at: string | null;
	ends_at: string | null;
	doors_open_at: string | null;
	cover_url: string | null;
	published: boolean;
	capacity: number | null;
	status: EventStatus;
	access_type: EventAccessType;
	is_private: boolean;
	scheduled_publish_at: string | null;
	tickets_sold: number;
	/** null when a ticket type is unlimited or none is on sale */
	tickets_total: number | null;
	/** invited or joined */
	guests_in: number;
	guests_joined: number;
	/** asked to join and waiting for the organizer */
	guests_waiting: number;
	/** photos and videos in the album that guests can see */
	photos: number;
	has_sales: boolean;
	setup: EventSummary["setup"];
};

export type EventsCounts = Record<EventsView, number>;

export type EventsSection = { items: ManagerEvent[]; total: number };

export type ManagerEventsPage = {
	view: EventsView;
	counts: EventsCounts;
	/** Only on the "all" view */
	sections?: { live: EventsSection; upcoming: EventsSection; drafts: EventsSection; past: EventsSection };
	/** Every other view */
	items?: ManagerEvent[];
	total: number;
	page: number;
	limit: number;
};
