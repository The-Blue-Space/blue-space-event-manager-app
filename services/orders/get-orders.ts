import { variables } from "@/constants";
import { orders } from "@/constants/data/orders";
import axios from "@/lib/axios";
import buildQueryString from "@/lib/build-query-string";
import { generatePaginateResponse } from "@/lib/paginate";
import { PaginatedResponse } from "@/types/global.types";
import { Order, PaymentStatus } from "@/types/order.types";

type Parameters = {
	page: number;
	limit?: number;
	event_id?: string;
	payment_status?: PaymentStatus;
	search?: string;
};

type Response = PaginatedResponse<Order>;

export async function production(params: Parameters): Promise<Response> {
    const query_string= buildQueryString(params);
	const response = await axios.get(`/v1/orders?${query_string}`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(generatePaginateResponse(orders));
		}, 800);
	});
}

export default async function getOrders(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
