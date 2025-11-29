import { variables } from "@/constants";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { generatePaginateResponse } from "@/lib/paginate";
import { Payout } from "@/types/finance.types";
import { PaginatedResponse, PaginationQuery } from "@/types/global.types";

// get payout history
type Parameters = PaginationQuery & {
	status: string;
};
type Response = PaginatedResponse<Payout>;

export async function production(params: Parameters): Promise<Response> {
	const query_string = buildQueryString(params);
	const response = await axios.get(`/v1/payouts?${query_string}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { payoutHistory } = await import("@/constants/data/finance/payout-history");
	return new Promise((resolve) => {
		let filtered = [...payoutHistory];

		// Filter by status if provided
		if (params.status && params.status !== "all") {
			filtered = filtered.filter((p) => {
				if (params.status === "completed") return p.status === "paid";
				if (params.status === "pending") return p.status === "pending" || p.status === "requested";
				if (params.status === "failed") return p.status === "rejected";
				return true;
			});
		}

		// Apply pagination
		const page = params.page || 1;
		const limit = params.limit || 10;
		const start = (page - 1) * limit;
		const end = start + limit;
		const paginatedData = filtered.slice(start, end);

		setTimeout(() => resolve(generatePaginateResponse(paginatedData)), 500);
	});
}

export default async function getPayoutHistory(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
