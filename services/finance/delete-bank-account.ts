import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	bank_id: string;
};

type Response = void;

export async function production(params: Parameters): Promise<Response> {
	await axios.delete(`/v1/banks/${params.bank_id}`);
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), 800);
	});
}

export default async function deleteBankAccount(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

