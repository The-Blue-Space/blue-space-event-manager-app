import { variables } from "@/constants";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { ManagerProfile, User } from "@/types/user.types";

type Parameters = {
	login: string;
	password: string;
};

/**
 * On a browser that has finished an emailed sign-in link before, the server signs in straight away and sends the
 * session (the same answer as verify-mfa). On any other browser it emails a link and sends only the user.
 */
type Response = {
	user: User;
	access_token?: string;
	manager_profile?: ManagerProfile | null;
	expires_in?: number;
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
