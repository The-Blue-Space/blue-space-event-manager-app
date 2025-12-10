import type { User } from "./user.types";

export const MEDIA_TYPES = ["image", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export type Album = {
	id: string;
	event_id: string;
	created_at: string;
	updated_at: string;
};

export type EventUpload = {
	id: string;
	album_id: string;
	uploaded_by_id: string;
	media_type: MediaType;
	file_url: string;
	mime_type: string;
	file_size: number;
	file_name: string;
	public_id: string;
	uploaded_at: string;
	created_at: string;
	updated_at: string;
	is_highlight: boolean;
	is_hidden: boolean;
	// Optional fields for album manager features
	order?: number;
	is_active?: boolean;
	deleted_at?: string | null;
	// Relationships
	album?: Album;
	uploaded_by?: User;
};
