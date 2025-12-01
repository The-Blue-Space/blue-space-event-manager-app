import { variables } from "@/constants";
import { participants } from "@/constants/data/participants";
import axios from "@/lib/axios";
import { Participant, ParticipantStatus } from "@/types/participant.types";

type Parameters = {
	event_id: string;
	status?: ParticipantStatus;
};

type Response = Participant[];

export async function production(params: Parameters): Promise<Response> {
	const { event_id, status } = params;
	const url = status
		? `/v1/events/${event_id}/participants?status=${status}`
		: `/v1/events/${event_id}/participants`;
	const response = await axios.get(url);
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
		setTimeout(() => resolve(filteredParticipants), 800);
	});
}

export default async function getEventParticipants(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

