import { variables } from "@/constants";
import axios from "@/lib/axios";
import { VendorApplication, VendorApplicationStatus } from "@/types/vendor.types";

type Parameters = {
	event_id: string;
	status?: VendorApplicationStatus;
	page?: number;
	limit?: number;
};

type Response = {
	data: VendorApplication[];
	total: number;
	page: number;
	limit: number;
	total_pages: number;
};

export async function production(params: Parameters): Promise<Response> {
	const { event_id, ...query } = params;
	const response = await axios.get(`/v1/events/${event_id}/vendor-applications`, {
		params: query,
	});
	// The server sends its standard page shape ({docs, totalDocs, totalPages}); map it to what the tab expects.
	const page = response.data;
	return {
		data: page.docs ?? page.data ?? [],
		total: page.totalDocs ?? page.total ?? 0,
		page: page.page ?? 1,
		limit: page.limit ?? 10,
		total_pages: page.totalPages ?? page.total_pages ?? 1,
	};
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					data: [],
					total: 0,
					page: 1,
					limit: 20,
					total_pages: 0,
				}),
			1500
		);
	});
}

export default async function getEventVendorApplications(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();
	return production(params);
}
