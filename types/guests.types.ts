import { EventAccessType } from "./event-summary.types";

// Shape of GET /v1/events/:id/guests. Instants are RFC3339.

export type GuestFilter = "all" | "waiting" | "invited" | "joined" | "declined" | "withdrawn" | "blocked";
export type GuestStatus = "pending" | "invited" | "joined" | "rejected" | "retracted";

export type Guest = {
	/** participant id */
	id: string;
	user_id: string;
	name: string;
	username: string | null;
	email: string;
	avatar_url: string | null;
	status: GuestStatus;
	is_blocked: boolean;
	/** when they reached their current status: first paid ticket, joining, the invite or the block */
	since: string;
	/** when they first asked or were added */
	asked: string;
	/** paid tickets grouped by type, on ticket events */
	tickets: { name: string; count: number }[];
};

export type GuestsPage = {
	access_type: EventAccessType;
	is_private: boolean;
	counts: Record<GuestFilter, number>;
	/** everyone waiting for an answer, oldest first */
	waiting: Guest[];
	items: Guest[];
	total: number;
	page: number;
	limit: number;
};

/** Someone found by email or username, ready to invite. */
export type Invitee = { id: string; name: string; username?: string; email?: string; avatar_url?: string };
