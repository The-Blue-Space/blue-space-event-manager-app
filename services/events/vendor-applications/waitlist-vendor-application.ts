import { variables } from "@/constants";
import axios from "@/lib/axios";
import { VendorApplication } from "@/types/vendor.types";

type Parameters = {
	id: string;
	event_id: string;
};

type Response = VendorApplication;

export async function production(params: Parameters): Promise<Response> {
	const { id, event_id } = params;
	const response = await axios.put(`/v1/events/${event_id}/vendor-applications/${id}/waitlist`);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					id: "mock-id",
					event_id: "mock-event-id",
					package_id: "mock-package-id",
					vendor_profile_id: "mock-vendor-profile-id",
					quantity: 1,
					status: "waitlisted",
					form_responses: {},
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				}),
			1500
		);
	});
}

export default async function waitlistVendorApplication(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
