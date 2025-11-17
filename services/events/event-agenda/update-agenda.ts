import { variables } from "@/constants";
import { eventAgendas } from "@/constants/data/events/event-agenda";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { EventAgenda } from "@/types/event-agenda.types";

type Parameters = {
	event_Id: string;
	agenda_id: string;
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

	const response = await axios.put(
		`/v1/events/${params.event_Id}/agenda/${params.agenda_id}`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	return new Promise((resolve) => {
		// Find and update the agenda item
		const existingAgenda = eventAgendas.find((agenda) => agenda.id === params.agenda_id);
		if (!existingAgenda) {
			throw new Error("Agenda item not found");
		}

		const updatedAgenda: EventAgenda = {
			...existingAgenda,
			title: params.title,
			description: params.description,
			start_time: params.start_time,
			end_time: params.end_time,
			hosts: params.hosts.map((host, index) => ({
				id: existingAgenda.hosts[index]?.id || `host_${Date.now()}_${index}`,
				event_id: params.event_Id,
				host_name: host.name,
				host_image_url: host.image
					? URL.createObjectURL(host.image)
					: existingAgenda.hosts[index]?.host_image_url ||
					  "https://api.dicebear.com/7.x/avataaars/svg?seed=" + host.name,
				created_at: existingAgenda.hosts[index]?.created_at || new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})),
			updated_at: new Date().toISOString(),
		};
		setTimeout(() => resolve(updatedAgenda), 1000);
	});
}

export default async function updateAgenda(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
