import type { ManagerProfile, User } from "./user.types";
import type { EventMedia } from "./event-media.types";
import type { EventCategory } from "./event-category.types";
import type { EventShotQuota } from "./event-shot-quota.types";

export const ACCESS_TYPES = ["general", "individual", "ticket-based", "none"] as const;

export type AccessType = (typeof ACCESS_TYPES)[number];

export const AGE_RESTRICTION_TYPES = ["age-restricted", "no-age-restriction"] as const;
export type AgeRestrictionType = (typeof AGE_RESTRICTION_TYPES)[number];

export const AGE_RESTRICTIONS = ["12+", "13+", "14+", "16+", "18+", "19+", "21+"] as const;
export type AgeRestriction = (typeof AGE_RESTRICTIONS)[number];

export const PARKING_TYPES = ["free-parking", "paid-parking", "no-parking", ] as const;
export type ParkingType = (typeof PARKING_TYPES)[number];

export type Event = {
	id: string;
	title: string;
	description: string;
	location_id?: string | null;
	venue_name?: string | null;
	address: string;
	city: string;
	state?: string | null;
	country?: string | null;
	postal_code?: string | null;
	google_map_url?: string | null;
	age_restriction_type?: AgeRestrictionType | null;
	age_restriction?: AgeRestriction | null;
	parking_type?: ParkingType | null;
	longitude?: string | null;
	latitude?: string | null;
	event_category_id?: string | null;
	tags?: string | null;
	event_start_date?: string | null;
	event_end_date?: string | null;
	event_start_time?: string | null;
	event_end_time?: string | null;
	event_ticket_id?: string | null;
	is_private: boolean;
	access_type: AccessType;
	access_code?: string | null;
	qr_code?: string | null;
	enable_downloads: boolean;
	allow_individual_upload: boolean;
	allow_professional_upload: boolean;
	published: boolean;
	published_at?: string | null;
	is_duplicated: boolean;
	event_plan_id?: string | null;
	event_shot_quota_id?: string | null;
	created_by_id?: string | null;
	previous_event_id?: string | null;
	max_participants?: number | null;
	first_accessed_at?: string | null;
	total_accessed_count?: number | null;
	last_accessed_at?: string | null;
	deleted_at?: string | null;
	doors_open_at?: string | null;
	created_at: string;
	updated_at: string;
	created_by: ManagerProfile;
	// metrics
	ticket_sold?: number | null;
	total_uploads?: number;
	total_participants?: number;
	total_revenue?: number | null;
	total_refunds?: number | null;
	event_media?: EventMedia[];
	event_category?: EventCategory;
	event_shot_quota?: EventShotQuota;
	// Overview and Good to Know
	overview?: string | null;
	faq?: string | null;
};

export type EventFaq = {
	question: string;
	answer: string;
};

export const ACTIVITY_TYPES = [
	"ticket_purchase",
	"check_in",
	"event_update",
	"comment",
	"refund",
	"registration",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type EventActivity = {
	id: string;
	event_id: string;
	type: ActivityType;
	action: string;
	details: string;
	user: User;
	timestamp: string;
	metadata?: Record<string, any>;
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
	ticket_purchase: "Ticket Purchase",
	check_in: "Check-in",
	event_update: "Event Update",
	comment: "Comment",
	refund: "Refund",
	registration: "Registration",
};

export type EventMetrics = {
	total_tickets_sold: number;
	total_participants: number;
	total_uploads: number;
	total_refunds: number;
	total_revenue: number;
};

export type EventsOverview = {
	total_events: number;
	published_events: number;
	unpublished_events: number;
	total_revenue: number;
};

export type EventsFilterParams = {
	search?: string; // Search by title, tags
	category?: string; // Filter by category ID
	access_type?: AccessType; // Filter by access type
	published?: string; // Filter by published status ("true" | "false")
	start_date?: string; // Filter by date range (ISO string)
	end_date?: string; // Filter by date range (ISO string)
	sort_by?: string; // Sort field (backend decides options)
	sort_order?: "asc" | "desc"; // Sort order
	page?: number; // Page number for pagination
	limit?: number; // Items per page
};
