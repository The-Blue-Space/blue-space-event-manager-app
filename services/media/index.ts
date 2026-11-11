import axios from "@/lib/axios";
import { EventMedia, EventMediaType } from "@/types/event-media.types";

type Progress = { onProgress?: (percent: number) => void; signal?: AbortSignal };

// Uploads can be large (videos up to 100 MB), so they don't use the app's 20-second timeout.
const uploadConfig = ({ onProgress, signal }: Progress) => ({
	timeout: 0,
	signal,
	headers: { "Content-Type": "multipart/form-data" },
	onUploadProgress: (event: { loaded: number; total?: number }) => {
		if (event.total) onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
	},
});

/** Every photo, video and the cover for an event, in order. */
export async function listMedia(eventId: string): Promise<EventMedia[]> {
	const response = await axios.get<EventMedia[]>(`/v1/events/${eventId}/media`);
	return response.data ?? [];
}

export async function uploadMedia(eventId: string, file: File, mediaType: EventMediaType, progress: Progress = {}): Promise<EventMedia> {
	const form = new FormData();
	form.append("file", file);
	form.append("media_type", mediaType);
	const response = await axios.post<EventMedia>(`/v1/events/${eventId}/media`, form, uploadConfig(progress));
	return response.data;
}

/** Swaps the file behind a photo or video. The old file stays until the new one has uploaded. */
export async function replaceMediaFile(eventId: string, mediaId: string, file: File, progress: Progress = {}): Promise<EventMedia> {
	const form = new FormData();
	form.append("file", file);
	const response = await axios.put<EventMedia>(`/v1/events/${eventId}/media/${mediaId}/replace-file`, form, uploadConfig(progress));
	return response.data;
}

export const removeMedia = (eventId: string, mediaId: string) => axios.delete(`/v1/events/${eventId}/media/${mediaId}`);

export async function reorderPhotos(eventId: string, photoIds: string[]): Promise<EventMedia[]> {
	const response = await axios.post<EventMedia[]>(`/v1/events/${eventId}/media/reorder`, { photo_ids: photoIds });
	return response.data;
}

/** Makes a photo the cover; the old cover takes the photo's place. */
export async function makeCover(eventId: string, mediaId: string): Promise<EventMedia[]> {
	const response = await axios.post<EventMedia[]>(`/v1/events/${eventId}/media/${mediaId}/cover`, {});
	return response.data;
}
