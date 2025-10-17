import type { User } from "./user.types";

export type EventAccessCode = {
	id: string;
	event_id: string;
	user_id?: string | null;
	user: User;
	code: string;
	qr_code?: string;
	is_used: boolean;
	used_at?: string | null;
	is_disabled: boolean;
	disabled_at?: string | null;
	created_at: string;
	updated_at: string;
};
