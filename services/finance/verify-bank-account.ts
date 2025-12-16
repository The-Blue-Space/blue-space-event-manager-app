import { variables } from "@/constants";
import axios from "@/lib/axios";

// verify bank account
type Parameters = {
	bank_code: string;
	account_number: string;
};

type Response = {
	name: string;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post("/v1/banks/verify", {
		bank_code: params.bank_code,
		account_number: params.account_number,
	});
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		// Default development data
		setTimeout(() => resolve({ name: "JON DOE" }), 600);
	});
}

export default async function verifyBankAccount(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}

