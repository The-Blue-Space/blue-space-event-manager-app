import { variables } from "@/constants";
import { participants } from "@/constants/data/participants";
import axios from "@/lib/axios";

type Parameters = {
	event_id: string;
	user_ids: string[];
};

type Response = {
	success: boolean;
	message: string;
	invited_count: number;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post("/v1/participants/invite", params);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { event_id, user_ids } = params;

	// Simulate adding invitations to mock data
	user_ids.forEach((user_id) => {
		const existingParticipant = participants.find(
			(p) => p.event_id === event_id && p.user_id === user_id
		);

		if (!existingParticipant) {
			// In real implementation, this would be added to the mock array
			console.log(`Mock: Invited user ${user_id} to event ${event_id}`);
		}
	});

	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					success: true,
					message: "Invitations sent successfully",
					invited_count: user_ids.length,
				}),
			1000
		);
	});
}

export default async function sendInvites(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

