import axios from "@/lib/axios";

// The organizer's Album tab: GET /v1/events/:id/album and its actions, settings and comments.

export type AlbumFilter = "all" | "highlights" | "videos" | "hidden";
export type AlbumAction = "highlight" | "unhighlight" | "hide" | "unhide" | "delete";

export type AlbumItem = {
	id: string;
	media_type: "photo" | "video";
	file_url: string;
	file_name: string;
	is_highlight: boolean;
	is_hidden: boolean;
	uploaded_at: string;
	uploader_id: string;
	uploader: string;
	by_organizer: boolean;
	likes: number;
	comments: number;
};

export type AlbumSettings = { allow_guest_uploads: boolean; guests_can_save: boolean; per_guest: number; limit: number; used: number };

export type AlbumPage = {
	counts: Record<AlbumFilter, number>;
	contributors: number;
	highlights: AlbumItem[];
	items: AlbumItem[];
	total: number;
	page: number;
	limit: number;
	settings: AlbumSettings;
};

export type AlbumComment = { id: string; name: string; content: string; created_at: string };

export async function getAlbum(eventId: string, filter: AlbumFilter, oldestFirst: boolean, page: number, limit = 24): Promise<AlbumPage> {
	const response = await axios.get<{ data: AlbumPage }>(`/v1/events/${eventId}/album`, {
		params: { filter, sort: oldestFirst ? "oldest" : "newest", page, limit },
	});
	return response.data.data;
}

export const actOnAlbum = (eventId: string, ids: string[], action: AlbumAction) => axios.post(`/v1/events/${eventId}/album/actions`, { ids, action });

export async function saveAlbumSettings(eventId: string, settings: Partial<Pick<AlbumSettings, "allow_guest_uploads" | "guests_can_save" | "per_guest">>): Promise<AlbumSettings> {
	const response = await axios.put<{ data: AlbumSettings }>(`/v1/events/${eventId}/album/settings`, settings);
	return response.data.data;
}

export async function getAlbumComments(eventId: string, mediaId: string): Promise<AlbumComment[]> {
	const response = await axios.get<{ data: AlbumComment[] }>(`/v1/events/${eventId}/album/${mediaId}/comments`);
	return response.data.data ?? [];
}

/** Uploads one photo or video to the album as the signed-in organizer. */
export async function uploadToAlbum(eventId: string, file: File, onProgress?: (percent: number) => void, signal?: AbortSignal) {
	const form = new FormData();
	form.append("file", file);
	form.append("media_type", file.type.startsWith("video/") ? "video" : "photo");
	const response = await axios.post(`/v1/media/event/${eventId}/upload`, form, {
		timeout: 0,
		signal,
		headers: { "Content-Type": "multipart/form-data" },
		onUploadProgress: (event) => {
			if (event.total) onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
		},
	});
	return response.data;
}
