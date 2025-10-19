import { variables } from "@/constants";
import axios from "@/lib/axios";

type Parameters = {
	eventId: string;
};

type Response = {
	success: boolean;
	message: string;
};

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.delete(`/v1/events/${params.eventId}`);
	return response.data;
}

export async function development(): Promise<Response> {
	// Mock delete - in development just return success
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					success: true,
					message: "Event deleted successfully",
				}),
			800
		);
	});
}

export default async function deleteEvent(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development();

	return production(params);
}
