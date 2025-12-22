import { variables } from "@/constants";
import axios from "@/lib/axios";
import { VendorPackage, FormSchemaField } from "@/types/vendor.types";

type Parameters = {
	event_id: string;
	name: string;
	description?: string;
	price: number;
	currency_id: string | null;
	total_quantity: number;
	max_per_vendor: number;
	requires_approval?: boolean | null;
	amenities?: Record<string, unknown>;
	form_schema?: FormSchemaField[];
};

type Response = VendorPackage;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.post(`/v1/events/${params.event_id}/vendor-packages`, params);
	return response.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					id: "mock-id",
					event_id: "mock-event-id",
					name: params.name,
					description: params.description || "",
					price: params.price,
					currency_id: params.currency_id || "",
					total_quantity: params.total_quantity,
					max_per_vendor: params.max_per_vendor,
					requires_approval: params.requires_approval ?? null,
					amenities: params.amenities || {},
					form_schema: params.form_schema || [],
					is_active: true,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				}),
			1500
		);
	});
}

export default async function addVendorPackage(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
