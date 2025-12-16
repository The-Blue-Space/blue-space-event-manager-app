import { variables } from "@/constants";
import { eventLineups } from "@/constants/data/events/event-lineup";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { EventLineup } from "@/types/event-agenda.types";

type Parameters = {
	lineupId: string;
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

	const response = await axios.put(`/v1/lineup/${params.lineupId}`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Find existing lineup and update it
	const existingLineup = eventLineups.find(l => l.id === params.lineupId);
	if (!existingLineup) {
		throw new Error("Lineup not found");
	}

	const updatedLineup: EventLineup = {
		...existingLineup,
		artist_name: params.artist_name,
		artist_image_url: params.artist_image ? URL.createObjectURL(params.artist_image) : existingLineup.artist_image_url,
		start_time: params.start_time || null,
		end_time: params.end_time || null,
		is_headliner: params.is_headliner,
		notes: params.notes || undefined,
		socials: params.socials || [],
		updated_at: new Date().toISOString(),
	};

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(updatedLineup);
		}, 1000);
	});
}

export default async function updateLineup(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
