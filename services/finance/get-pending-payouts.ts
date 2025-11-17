import { variables } from "@/constants";
import { pendingPayouts } from "@/constants/data/finance/pending-payouts";
import axios from "@/lib/axios";
import { generatePaginateResponse } from "@/lib/paginate";
import { Payout } from "@/types/finance.types";
import { PaginatedResponse } from "@/types/global.types";

type Response = PaginatedResponse<Payout>;

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/payouts?status=pending`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(generatePaginateResponse(pendingPayouts)), 800);
	});
}

export default async function getPendingPayouts(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production();
}
