import { variables } from "@/constants";
import { pendingPayouts } from "@/constants/data/finance/pending-payouts";
import axios from "@/lib/axios";
import { Payout } from "@/types/finance.types";

type Parameters = {
	event_id: string;
	bank_id: string;
};

type Response = Payout;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post("/v1/payouts/request", {
		event_id: params.event_id,
		bank_id: params.bank_id,
	});
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const payout = pendingPayouts.find(
			(p) => p.event_id === params.event_id && p.status === "pending"
		);
		if (!payout) {
			throw new Error("Payout not found");
		}
		const updated: Payout = {
			...payout,
			status: "requested",
			requested_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setTimeout(() => resolve(updated), 900);
	});
}

export default async function requestPayout(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

