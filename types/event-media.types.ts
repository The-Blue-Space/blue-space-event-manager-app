import type { Event } from "./event.types";

export type EventMediaType = "cover" | "image" | "video";

export type EventMedia = {
	id: string;
	event_id: string;
	url: string;
	file_name: string;
	file_size: number;
	mime_type: string;
	public_id: string;
	media_type: EventMediaType;
	order: number;
	is_active: boolean;
	deleted_at?: string | null;
	created_at: string;
	updated_at: string;
	event?: Event;
};
