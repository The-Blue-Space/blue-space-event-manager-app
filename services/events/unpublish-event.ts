import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = { event_id: string };

export async function production({ event_id }: Parameters): Promise<void> {
	await axios.put(`/v1/events/${event_id}/unpublish`, {});
}

export async function development(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 800));
}

export default async function unpublishEvent(params: Parameters): Promise<void> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
