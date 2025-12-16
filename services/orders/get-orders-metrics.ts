import { variables } from "@/constants";
import { orders } from "@/constants/data/orders";
import axios from "@/lib/axios";


type Response = {
	total_orders: number;
	pending_orders: number;
	paid_orders: number;
	refunded_orders: number;
};

export async function production(): Promise<Response> {
	const response = await axios.get("/v1/orders/metrics");
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => {
			const totalOrders = orders.length;
			const pendingOrders = orders.filter((order) => order.payment_status === "pending").length;
			const paidOrders = orders.filter((order) => order.payment_status === "paid").length;
			const refundedOrders = orders.filter((order) => order.payment_status === "refunded").length;

			resolve({
				total_orders: totalOrders,
				pending_orders: pendingOrders,
				paid_orders: paidOrders,
				refunded_orders: refundedOrders,
			});
		}, 800);
	});
}

export default async function getOrdersMetrics(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production();
}
