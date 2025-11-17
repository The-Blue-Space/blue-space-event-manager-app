import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	email: string;
};

type Response = void;

export async function production(data: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/auth/send-mfa`, data);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), 2000);
	});
}

export default async function sendMFACode(data: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(data);
}
