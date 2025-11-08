import { variables } from "@/constants";
import { bankDetails } from "@/constants/data/finance/bank-details";
import axios from "@/lib/axios";
import { BankDetails } from "@/types/finance.types";

type Parameters = {
	bank_id: string;
};

type Response = BankDetails[];

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.patch(`/v1/banks/${params.bank_id}/set-default`);
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		// Simulate updating all banks to set the selected one as default
		const updated = bankDetails.map((bank) => ({
			...bank,
			is_default: bank.id === params.bank_id,
		}));
		setTimeout(() => resolve(updated), 800);
	});
}

export default async function setDefaultBank(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

