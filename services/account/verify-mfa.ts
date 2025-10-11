import { variables } from "@/constants";
import { manager_profiles } from "@/constants/data/manager-profile";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { ManagerProfile, User } from "@/types/user.types";

type Parameters = {
	token: string;
};

type Response = {
	access_token: string;
	user: User;
	manager_profile: ManagerProfile;
	expires_in: number;
};

export async function production(data: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/auth/verify-mfa`, data);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					access_token: "1|QO3mTgijpbdTDIn9ReV63jzoytn309IT5evZpNt5fadcdc1e",
					user: users[0],
					manager_profile: manager_profiles[0],
					expires_in: 86400,
				}),
			2000
		);
	});
}

export default async function verifyMFA(data: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(data);
}
