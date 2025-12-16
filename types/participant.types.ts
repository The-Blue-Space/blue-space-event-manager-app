import type { User } from "./user.types";
import type { EventAccessCode } from "./event-access-code.types";
import type { UserTicket } from "./user-ticket.types";

export const PARTICIPANT_ROLES = ["attendee", "photographer"] as const;

export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const PARTICIPANT_STATUSES = ["pending", "invited", "joined", "rejected", "retracted"] as const;
export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

export type Participant = {
	id: string;
	event_id: string;
	user_id: string;
	role: ParticipantRole;
	status: ParticipantStatus;
	user_ticket_id: string | null;
	access_code_id: string | null;
	joined_at: string | null;
	ip_address: string | null;
	is_blocked: boolean;
	blocked_at: string | null;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
	user: User;
	access_code: EventAccessCode | null;
	user_ticket: UserTicket | null;
};
