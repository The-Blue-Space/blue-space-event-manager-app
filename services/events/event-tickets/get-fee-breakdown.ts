import { variables } from "@/constants";
import axios from "@/lib/axios";
import { Currency } from "@/types/global.types";

type Parameters = {
	event_id: string;
	price: number;
	currency_id: string;
};

type Response = {
	total_fee: number;
	currency: Currency;
	service_fee: {
		amount: number;
		percentage: number;
	};
	processing_fee: {
		amount: number;
		percentage: number;
	};
	net_amount: number;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/tickets/fee-breakdown`, params);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					total_fee: 100,
					currency: {
						id: "1",
						name: "Nigeria",
						code: "NG",
						symbol: "₦",
					},
					service_fee: {
						amount: 10,
						percentage: 10,
					},
					processing_fee: {
						amount: 10,
						percentage: 10,
					},
					net_amount: 80,
				}),
			1500
		);
	});
}

export default async function getFeeBreakdown(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
