import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = { event_id: string; publish_at?: string };

// A publish_at in the future schedules the event; without one it goes live now.
export async function production({ event_id, publish_at }: Parameters): Promise<void> {
	await axios.put(`/v1/events/${event_id}/publish`, publish_at ? { publish_at } : {});
}

export async function development(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 800));
}

export default async function publishEvent(params: Parameters): Promise<void> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
