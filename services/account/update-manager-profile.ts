import { variables } from "@/constants";
import { manager_profiles } from "@/constants/data/manager-profile";
import axios from "@/lib/axios";
import { ManagerProfile } from "@/types/user.types";

type Parameters = {
	id: string;
	payload: Partial<ManagerProfile>;
};

type Response = ManagerProfile;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.put(`/v1/manager-profile`, params.payload);
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Simulate API delay
	return new Promise((resolve) => {
		setTimeout(() => {
			const existingProfile = manager_profiles.find((p) => p.id === params.id);
			const updatedProfile = {
				...existingProfile!,
				...params.payload,
				updated_at: new Date().toISOString(),
			};
			resolve(updatedProfile);
		}, 1000);
	});
}

export default async function updateManagerProfile(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
