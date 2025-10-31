import { variables } from "@/constants";
import axios from "@/lib/axios";
import { Currency } from "@/types/global.types";

type Response = Currency[];

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/currencies`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve([
					{
						id: "1",
						name: "Nigeria",
						code: "NG",
						symbol: "₦",
					},
					{
						id: "2",
						name: "United States",
						code: "USD",
						symbol: "$",
					},
				]),
			1000
		);
	});
}

export default async function getCurrencies(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
