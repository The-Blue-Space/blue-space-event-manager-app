import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	email: string;
};

type Response = {
	message: string;
};

export async function production(data: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/auth/forgot-password`, data);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ message: "ok" }), 1000);
	});
}

export default async function forgotPassword(data: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(data);
}
