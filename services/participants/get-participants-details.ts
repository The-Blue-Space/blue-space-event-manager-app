import { variables } from "@/constants";
import { participants } from "@/constants/data/participants";
import axios from "@/lib/axios";
import { Participant } from "@/types/participant.types";

type Parameters = {
	user_id: string;
};

type Response = Participant;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/participants?user_id=${params.user_id}`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(participants[0]), 800);
	});
}

export default async function getEventParticipants(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
