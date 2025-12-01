import { variables } from "@/constants";
import { participants } from "@/constants/data/participants";
import axios from "@/lib/axios";
import { Participant } from "@/types/participant.types";

type Parameters = {
	participant_id: string;
};

type Response = Participant;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.patch(`/v1/participants/${params.participant_id}/reject`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { participant_id } = params;

	// Find and update participant status
	const participant = participants.find((p) => p.id === participant_id);

	if (!participant) {
		throw new Error("Participant not found");
	}

	// Update status to rejected
	const updatedParticipant = {
		...participant,
		status: "rejected" as const,
		updated_at: new Date().toISOString(),
	};

	// In real implementation, this would update the mock array
	console.log(`Mock: Rejected participant ${participant_id}`);

	return new Promise((resolve) => {
		setTimeout(() => resolve(updatedParticipant), 800);
	});
}

export default async function rejectParticipant(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

