import type { Event } from "./event.types";

export type EventShotQuota ={
	id: string;
	event_id: string;
	allowed_shots: number;
	allowed_shots_per_participant: number;
	created_at: string;
	updated_at: string;
	event?: Event;
};
 