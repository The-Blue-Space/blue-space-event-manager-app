import { variables } from "@/constants";
import { eventCategories } from "@/constants/data/events/event-category";
import axios from "@/lib/axios";
import { EventCategory } from "@/types/event-category.types";

type Response = EventCategory[];

export async function production(): Promise<Response> {
	const response = await axios.get(`/v1/events/active`);
	return response.data.data;
}

export async function development(): Promise<Response> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(eventCategories), 1000);
	});
}

export default async function getEventCategories(): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production();
}
