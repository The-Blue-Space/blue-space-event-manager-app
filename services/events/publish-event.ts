import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = { event_id: string; published_at?: string };

// The server takes the user from the session; published_at in the future schedules the event instead.
export async function production({ event_id, published_at }: Parameters): Promise<void> {
	await axios.put(`/v1/events/${event_id}/publish`, published_at ? { published_at } : {});
}

export async function development(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 800));
}

export default async function publishEvent(params: Parameters): Promise<void> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
