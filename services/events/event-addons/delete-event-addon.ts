import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	id: string;
};

type Response = void;

export async function production(params: Parameters): Promise<Response> {
	await axios.delete(`/v1/event-addons/${params.id}`);
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), 800);
	});
}

export default async function deleteEventAddon(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
