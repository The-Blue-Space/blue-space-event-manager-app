import { variables } from "@/constants";
import { manager_profiles } from "@/constants/data/manager-profile";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { ManagerProfile, User } from "@/types/user.types";

type Response = {
	user: User
	managerProfile: ManagerProfile
};

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/user`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ user: users[0], managerProfile: manager_profiles[0] }), 2000);
	});
}

export default async function whoami(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
