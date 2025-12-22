import { variables } from "@/constants";
import axios from "@/lib/axios";
import { VendorPackage, FormSchemaField } from "@/types/vendor.types";

type Parameters = {
	id: string;
	event_id: string;
	name?: string;
	description?: string;
	price?: number;
	currency_id?: string | null;
	total_quantity?: number;
	max_per_vendor?: number;
	requires_approval?: boolean | null;
	amenities?: Record<string, unknown>;
	form_schema?: FormSchemaField[];
	is_active?: boolean;
};

type Response = VendorPackage;

export async function production(params: Parameters): Promise<Response> {
	const { id, event_id, ...data } = params;
	const response = await axios.put(`/v1/events/${event_id}/vendor-packages/${id}`, data);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					id: "mock-id",
					event_id: "mock-event-id",
					name: "Updated Package",
					description: "",
					price: 0,
					currency_id: "",
					total_quantity: 10,
					max_per_vendor: 1,
					requires_approval: null,
					amenities: {},
					form_schema: [],
					is_active: true,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				}),
			1500
		);
	});
}

export default async function updateVendorPackage(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
