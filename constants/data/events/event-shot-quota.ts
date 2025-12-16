import { EventShotQuota } from "@/types/event-shot-quota.types";

export const eventShotQuotas: EventShotQuota[] = [
	{
		id: "1",
		event_id: "1",
		allowed_shots: 100,
		allowed_shots_per_participant: 10,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: "2",
		event_id: "2",
		allowed_shots: 100,
		allowed_shots_per_participant: 10,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];
