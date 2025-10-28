import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	event_Id: string;
	agenda_id: string;
};

type Response = { success: boolean };

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.delete(`/v1/events/${params.event_Id}/agenda/${params.agenda_id}`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ success: true }), 800);
	});
}

export default async function deleteAgenda(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
