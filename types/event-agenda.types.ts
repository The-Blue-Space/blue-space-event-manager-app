export type EventAgenda = {
	id: string;
	event_id: string;
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	hosts: AgendaHost[];
	created_at: string;
	updated_at: string;
};

export type AgendaHost = {
	id: string;
	event_id: string;
	host_name: string;
	host_image_url: string;
	created_at: string;
	updated_at: string;
};

export type EventLineup = {
	id: string;
	event_id: string;
	notes?: string;
	artist_name: string;
	artist_image_url: string | null;
	start_time?: string|null;
	end_time?: string|null;
    is_headliner: boolean;
    socials: string[]
	order: number;
	created_at: string;
	updated_at: string;
};
