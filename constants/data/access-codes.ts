import { EventAccessCode } from "@/types/event-access-code.types";
import { users } from "./user";

export const accessCodes: EventAccessCode[] = [
	{
		id: "1",
		event_id: "1",
		user_id: "1",
		code: "1234567890",
		qr_code: "1234567890",
		is_used: false,
		used_at: null,
		is_disabled: false,
		disabled_at: null,
		user: users[0],
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: "2",
		event_id: "1",
		user_id: "2",
		code: "1234567890",
		qr_code: "1234567890",
		is_used: false,
		used_at: null,
		is_disabled: false,
		disabled_at: null,
		user: users[1],
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];
