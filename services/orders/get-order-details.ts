import { variables } from "@/constants";
import { orders } from "@/constants/data/orders";
import axios from "@/lib/axios";
import { Order } from "@/types/order.types";

type Response = Order;
type Parameters = {
	orderId: string;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/orders/${params.orderId}/details`);
	return response.data;
}

export async function development(): Promise<Response> {
	// Mock detailed order data

	return new Promise((resolve) => {
		setTimeout(() => resolve(orders[0]), 800);
	});
}

export default async function getOrderDetails(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
