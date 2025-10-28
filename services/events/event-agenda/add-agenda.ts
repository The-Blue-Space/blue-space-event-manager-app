import { variables } from "@/constants";
import { eventAgendas } from "@/constants/data/events/event-agenda";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { EventAgenda } from "@/types/event-agenda.types";

type Parameters = {
	event_Id: string;
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	hosts: Array<{
		name: string;
		image?: File;
	}>;
};

type Response = EventAgenda;

export async function production(params: Parameters): Promise<Response> {
	const formData = buildFormData({
		title: params.title,
		description: params.description,
		start_time: params.start_time,
		end_time: params.end_time,
		hosts: params.hosts,
	});

	const response = await axios.post(`/v1/events/${params.event_Id}/agenda`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		// Create a new agenda item
		const newAgenda: EventAgenda = {
			id: `agenda_${Date.now()}`,
			event_id: params.event_Id,
			title: params.title,
			description: params.description,
			start_time: params.start_time,
			end_time: params.end_time,
			hosts: params.hosts.map((host, index) => ({
				id: `host_${Date.now()}_${index}`,
				event_id: params.event_Id,
				host_name: host.name,
				host_image_url: host.image
					? URL.createObjectURL(host.image)
					: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + host.name,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		setTimeout(() => resolve(newAgenda), 1500);
	});
}

export default async function addAgenda(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
