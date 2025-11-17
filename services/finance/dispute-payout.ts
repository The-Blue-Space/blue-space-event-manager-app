import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	payout_id: string;
	dispute_reason: string;
};

type Response = {
	success: boolean;
	message?: string;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/payouts/${params.payout_id}/dispute`, {
		dispute_reason: params.dispute_reason,
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ success: true, message: "Dispute submitted successfully" }), 900);
	});
}

export default async function disputePayout(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

