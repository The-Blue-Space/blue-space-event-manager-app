import { variables } from "@/constants";
import axios from "@/lib/axios";
import { RefundStats } from "@/types/refund.types";

type Response = RefundStats;

export async function production(): Promise<Response> {
	const response = await axios.get("/v1/refunds/stats");
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				total_refunds: 15,
				pending_refunds: 3,
				completed_refunds: 10,
				rejected_refunds: 2,
				total_refunded_amount: 45000000, // in kobo
				pending_refund_amount: 8500000,
			});
		}, 600);
	});
}

export default async function getRefundsStats(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production();
}
