import { variables } from "@/constants";
import axios from "@/lib/axios";
import { generateDigits } from "@/lib/generate-digits";
import { EventMetrics } from "@/types/event.types";

type Parameters = {
	eventId: string;
};

type Response = EventMetrics;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/events/${params.eventId}/metrics`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					total_tickets_sold: generateDigits(9999),
					total_participants: generateDigits(9999),
					total_uploads: generateDigits(99),
					total_refunds: generateDigits(99),
					total_revenue: generateDigits(99999),
				}),
			1000
		);
	});
}

export default async function getEventMetrics(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
