import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	bank_name: string;
	account_number: string;
	account_name: string;
};

type Response = {
	otp_sent: boolean;
	message?: string;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post("/v1/banks/request-otp", {
		bank_name: params.bank_name,
		account_number: params.account_number,
		account_name: params.account_name,
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ otp_sent: true, message: "OTP sent successfully" }), 800);
	});
}

export default async function requestBankOTP(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}

