import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	lineupId: string;
};

type Response = { success: boolean };

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.delete(`/v1/lineup/${params.lineupId}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ success: true });
		}, 800);
	});
}

export default async function deleteLineup(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
