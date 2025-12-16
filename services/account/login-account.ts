import { variables } from "@/constants";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { User } from "@/types/user.types";

type Parameters = {
	login: string;
	password: string;
};

type Response = {
	user: User;
};

export async function production(data: Parameters): Promise<Response> {
	const response = await axios.post(`v1/auth/login`, {
		...data,
		account_type: "manager",
	});

	return  response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					user: users[0],
				}),
			2000
		);
	});
}

export default async function loginAccount(data: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(data);
}
