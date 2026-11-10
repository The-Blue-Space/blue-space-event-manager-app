// Shape of GET /v1/dashboard/home. Money is always integer kobo.

export type HomeChange = { current: number; previous: number; change_pct: number | null };

export type HomeEventSummary = {
	id: string;
	title: string;
	starts_at: string | null;
	cover_url: string | null;
	published: boolean;
	tickets_sold: number;
	capacity: number | null;
};

export type HomeSpotlight = {
	status: "live" | "upcoming";
	event: {
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
	};
	tickets_sold: number;
	revenue_kobo: number;
	tiers: { id: string; name: string; price_kobo: number | null; sold: number; total: number | null }[];
	checked_in: number;
	photos: { count: number; recent: { id: string; url: string }[] };
};

export type HomeOrder = {
	id: string;
	reference: string | null;
	buyer_name: string | null;
	buyer_username: string | null;
	buyer_avatar: string | null;
	event_title: string | null;
	quantity: number;
	amount_kobo: number;
	status: "paid" | "pending" | "refunded" | "failed";
	paid_at: string | null;
	refunded_at: string | null;
	created_at: string;
};

export type HomeDashboard = {
	has_events: boolean;
	spotlight: HomeSpotlight | null;
	coming_up: HomeEventSummary[];
	last_30_days: { tickets_sold: HomeChange; revenue_kobo: HomeChange; attendees: HomeChange };
	daily_tickets: { date: string; value: number }[];
	attention: {
		pending_refunds: number;
		drafts: { id: string; title: string; starts_at: string | null }[];
		has_bank_account: boolean;
	};
	withdrawable_kobo: number;
	recent_orders: HomeOrder[];
};
