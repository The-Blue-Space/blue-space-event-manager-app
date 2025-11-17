import { variables } from "@/constants";
import { banks } from "@/constants/data/finance/banks";
import axios from "@/lib/axios";
import { Bank } from "@/types/bank.types";

type Response = Bank[];

export async function production(): Promise<Response> {
	const response = await axios.get("/v1/banks");
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(banks), 500);
	});
}

export default async function getBanks(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production();
}

