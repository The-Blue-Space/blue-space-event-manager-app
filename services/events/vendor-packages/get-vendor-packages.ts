import { variables } from "@/constants";
import axios from "@/lib/axios";
import { VendorPackage } from "@/types/vendor.types";

type Parameters = {
	event_id: string;
};

type Response = VendorPackage[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.event_id}/vendor-packages`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve([]), 1500);
	});
}

export default async function getVendorPackages(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
