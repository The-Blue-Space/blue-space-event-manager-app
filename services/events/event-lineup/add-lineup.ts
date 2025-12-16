import { variables } from "@/constants";
import { eventLineups } from "@/constants/data/events/event-lineup";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { EventLineup } from "@/types/event-agenda.types";

type Parameters = {
	eventId: string;
	artist_name: string;
	artist_image?: File;
	start_time?: string;
	end_time?: string;
	is_headliner: boolean;
	notes?: string;
	socials?: string[];
};

type Response = EventLineup;

export async function production(params: Parameters): Promise<Response> {
	const formData = buildFormData({
		artist_name: params.artist_name,
		artist_image: params.artist_image,
		start_time: params.start_time,
		end_time: params.end_time,
		is_headliner: params.is_headliner,
		notes: params.notes,
		socials: params.socials,
	});

	const response = await axios.post(`/v1/events/${params.eventId}/lineup`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Generate new lineup item
	const newLineup: EventLineup = {
		id: `lineup-${Date.now()}`,
		event_id: params.eventId,
		artist_name: params.artist_name,
		artist_image_url: params.artist_image ? URL.createObjectURL(params.artist_image) : null,
		start_time: params.start_time || null,
		end_time: params.end_time || null,
		is_headliner: params.is_headliner,
		order: eventLineups.filter(l => l.event_id === params.eventId).length + 1,
		notes: params.notes || undefined,
		socials: params.socials || [],
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(newLineup);
		}, 1200);
	});
}

export default async function addLineup(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
