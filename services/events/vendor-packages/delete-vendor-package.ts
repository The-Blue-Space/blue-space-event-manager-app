import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	id: string;
	event_id: string;
};

type Response = void;

export async function production(params: Parameters): Promise<Response> {
	await axios.delete(`/v1/events/${params.event_id}/vendor-packages/${params.id}`);
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), 1500);
	});
}

export default async function deleteVendorPackage(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
