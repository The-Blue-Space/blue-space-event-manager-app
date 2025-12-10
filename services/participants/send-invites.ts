import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	event_id: string;
	users: { id: string; email: string }[];
};

type InviteResult = {
	user_id: string;
	email: string;
	error?: string;
	participant_id?: string;
	status?: string;
};

type Response = {
	results: InviteResult[];
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post("/v1/participants/invite", params);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() => {
				const results = params.users.map((user) => {
					// Simulate some failures randomly
					const hasError = Math.random() > 0.7;
					if (hasError) {
						return {
							user_id: user.id,
							email: user.email,
							error: "failed to create participant: ERROR: insert or update on table \"participants\" violates foreign key constraint \"fk_participants_user\" (SQLSTATE 23503)",
						};
					}
					return {
						user_id: user.id,
						email: user.email,
						participant_id: `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`,
						status: "joined",
					};
				});
				resolve({ results });
			},
			1000
		);
	});
}

export default async function sendInvites(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

