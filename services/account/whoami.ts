import { variables } from "@/constants";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { User } from "@/types/user.types";

type Response = User;

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/user`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(users[0]), 2000);
	});
}

export default async function whoami(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
