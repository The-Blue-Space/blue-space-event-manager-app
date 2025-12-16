import { variables } from "@/constants";
import { manager_profiles } from "@/constants/data/manager-profile";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { ManagerProfile } from "@/types/user.types";

type Parameters = Partial<Omit<ManagerProfile, "logo" | "display_image">> & {
	id: string;
	name: string;
	logo: File | null;
	display_image: File | null;
	bio: string | null;
	phone: string | null;
	email: string;
	operating_country_id: string;
};

type Response = ManagerProfile;

export async function production(params: Parameters): Promise<Response> {
	const formData = buildFormData(params, "dot"); // dot notation;
	const response = await axios.put(`/v1/manager-profiles/${params.id}`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}

export async function development(): Promise<Response> {
	// Simulate API delay
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(manager_profiles[0]);
		}, 1000);
	});
}

export default async function updateManagerProfile(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
