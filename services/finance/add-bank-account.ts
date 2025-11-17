import { variables } from "@/constants";
import { bankDetails } from "@/constants/data/finance/bank-details";
import axios from "@/lib/axios";
import { BankDetails } from "@/types/finance.types";

type Parameters = {
	bank_name: string;
	account_number: string;
	account_name: string;
	otp: string;
};

type Response = BankDetails;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post("/v1/banks", {
		bank_name: params.bank_name,
		account_number: params.account_number,
		account_name: params.account_name,
		otp: params.otp,
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		const newBank: BankDetails = {
			id: `bank_${Date.now()}`,
			event_manager_id: "manager_001",
			bank_name: params.bank_name,
			account_number: params.account_number,
			account_name: params.account_name,
			is_default: bankDetails.length === 0, // First bank is default
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setTimeout(() => resolve(newBank), 900);
	});
}

export default async function addBankAccount(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

