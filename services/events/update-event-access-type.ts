import { variables } from "@/constants";
import axios from "@/lib/axios";
import { AccessType, Event } from "@/types/event.types";

type Parameters = {
	event_id: string;
	access_type: AccessType;
};

type Response = Event;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.patch(`/v1/events/${params.event_id}/access-type`, {
		access_type: params.access_type,
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ access_type: params.access_type } as Event), 800);
	});
}

export default async function updateEventAccessType(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
