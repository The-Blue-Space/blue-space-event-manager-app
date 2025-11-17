import { variables } from "@/constants";
import { orders } from "@/constants/data/orders";

import axios from "@/lib/axios";
import { generateDigits } from "@/lib/generate-digits";
import { UserDashboardData } from "@/types/user.types";

type Response = UserDashboardData;

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/dashboard/metrics`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	const digits = () => generateDigits(99999);
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					overview: {
						total_events: {
							total_events: digits(),
							upcoming_events: digits(),
						},
						total_attendees: {
							total_attendees: digits(),
							attendees_this_month: digits(),
						},
						ticket_sales: {
							ticket_sales: digits(),
							ticket_sales_this_month: digits(),
						},
						revenue: {
							total_revenue: digits(),
							revenue_this_month: digits(),
						},
					},
					recent_orders: orders,
				}),
			2000
		);
	});
}

export default async function getDashboardData(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
