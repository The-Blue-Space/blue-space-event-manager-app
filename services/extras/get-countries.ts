import { variables } from "@/constants";
import axios from "@/lib/axios";
import { Country } from "@/types/global.types";

type Response = Country[];

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/events/active`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve([
					{
						id: "1",
						country_name: "Nigeria",
						country_code: "NG",
						country_flag: "https://flagcdn.com/ng.svg",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
					{
						id: "2",
						country_name: "Canada",
						country_code: "CA",
						country_flag: "https://flagcdn.com/ca.svg",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				]),
			1000
		);
	});
}

export default async function getCountries(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
