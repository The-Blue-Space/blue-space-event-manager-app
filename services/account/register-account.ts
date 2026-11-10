import { variables } from "@/constants";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { User } from "@/types/user.types";

type Parameters = {
	name: string;
	username: string;
	email: string;
	phone?: string;
	password: string;
};

type Response = {
	message: string;
	user: User;
};

export async function production(data: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/auth/register`, data);
	return response.data;
}

export async function development(data: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					message: "User registered successfully. Please check your email to verify your account.",
					user: { ...users[0], email: data.email },
				}),
			1200
		);
	});
}

export default async function registerAccount(data: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(data);

	return production(data);
}
