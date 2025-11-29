import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	lineupId: string;
	order: number;
};

type Response = { success: boolean };

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.patch(`/v1/lineup/${params.lineupId}/order`, {
		order: params.order,
	});
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ success: true });
		}, 600);
	});
}

export default async function reorderLineup(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
