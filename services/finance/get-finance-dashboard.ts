import { variables } from "@/constants";
import { financeDashboard } from "@/constants/data/finance/finance-dashboard";
import axios from "@/lib/axios";
import { FinanceDashboard } from "@/types/finance.types";

type Response = FinanceDashboard;

export async function production(): Promise<Response> {
	const response = await axios.get("/v1/finance/dashboard");
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(financeDashboard), 800);
	});
}

export default async function getFinanceDashboard(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production();
}

