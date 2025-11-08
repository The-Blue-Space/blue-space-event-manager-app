export type Media = {
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
    is_hidden:boolean 
	album: Album;
};

export const MEDIA_TYPE = ["photo", "video"] as const;
export type MediaType = (typeof MEDIA_TYPE)[number];

export type Album = {
	id: string;
	event_id: string;
	created_at: string;
	updated_at: string;
};
