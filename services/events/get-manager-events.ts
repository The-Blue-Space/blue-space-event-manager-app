import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { EventsView, ManagerEventsPage } from "@/types/manager-events.types";

export type ManagerEventsParams = { view: EventsView; search?: string; page?: number; limit?: number };

/** The organizer's own events, for the events list. */
export default async function getManagerEvents(params: ManagerEventsParams): Promise<ManagerEventsPage> {
	const query = buildQueryString({ ...params, search: params.search?.trim() || undefined });
	const response = await axios.get<{ data: ManagerEventsPage }>(`/v1/manager/events?${query}`);
	return response.data.data;
}
