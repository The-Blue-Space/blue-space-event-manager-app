import { variables } from "@/constants";
import { manager_profiles } from "@/constants/data/manager-profile";
import axios from "@/lib/axios";
import { ManagerProfile } from "@/types/user.types";

export async function production(id: string): Promise<ManagerProfile> {
	const response = await axios.get<ManagerProfile>(`/v1/manager-profiles/${id}`);
	return response.data;
}

export async function development(): Promise<ManagerProfile> {
	return new Promise((resolve) => setTimeout(() => resolve(manager_profiles[0]), 600));
}

export default async function getManagerProfile(id: string): Promise<ManagerProfile> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(id);
}
