import { variables } from "@/constants";
import { participants } from "@/constants/data/participants";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { generatePaginateResponse } from "@/lib/paginate";
import { PaginatedResponse } from "@/types/global.types";
import { Participant, ParticipantStatus } from "@/types/participant.types";

type Parameters = {
	event_id: string;
	status?: ParticipantStatus;
	user_id?: string;
	role?: string
};

type Response = PaginatedResponse<Participant>;

export async function production({event_id, ...params}: Parameters): Promise<Response> {
	const queryString = buildQueryString(params);
	const response = await axios.get(`/v1/events/${event_id}/participants?${queryString}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { event_id, status } = params;

	// Filter participants by event_id and optionally by status
	let filteredParticipants = participants.filter((p) => p.event_id === event_id);

	if (status) {
		filteredParticipants = filteredParticipants.filter((p) => p.status === status);
	}

	return new Promise((resolve) => {
		setTimeout(() => resolve(generatePaginateResponse(filteredParticipants)), 800);
	});
}

export default async function getEventParticipants(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

