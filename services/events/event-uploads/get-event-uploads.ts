import { variables } from "@/constants";
import axios from "@/lib/axios";
import { generatePaginateResponse } from "@/lib/paginate";
import { EventUpload } from "@/types/event-upload.types";
import { PaginatedResponse } from "@/types/global.types";

type Parameters = {
	eventId: string;
	page?: number;
	limit?: number;
};

type Response = PaginatedResponse<EventUpload>;

export async function production(params: Parameters): Promise<Response> {
	const { eventId, page = 1, limit = 10 } = params;
	const response = await axios.get(`/v1/media/event/${eventId}`, {
		params: { page, limit },
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Mock data for development
	const mockUploads: EventUpload[] = Array.from({ length: 25 }, (_, i) => ({
		id: `upload-${i + 1}`,
		is_highlight: i < 5,
		is_hidden: i % 7 !== 0,
		album_id: `album-1`,
		uploaded_by_id: `user-${i % 3 + 1}`,
		media_type: i % 3 === 0 ? "video" : "image",
		file_url: `https://picsum.photos/seed/${i + 1}/800/600`,
		mime_type: i % 3 === 0 ? "video/mp4" : "image/jpeg",
		file_size: Math.floor(Math.random() * 5000000) + 500000,
		file_name: `photo-${i + 1}.${i % 3 === 0 ? "mp4" : "jpg"}`,
		public_id: `event-uploads/${i + 1}`,
		uploaded_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
		created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
		updated_at: new Date(Date.now() - Math.random() * 86400000 * 10).toISOString(),
		// Album manager features
		order: i < 5 ? i + 1 : 0, // First 5 items are highlights
		is_active: i % 7 !== 0, // Make some inactive
		deleted_at: null,
		album: {
			id: "album-1",
			event_id: params.eventId,
			created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
			updated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
		},
		uploaded_by: {
			id: `user-${i % 3 + 1}`,
			name: `User ${i % 3 + 1}`,
			email: `user${i % 3 + 1}@example.com`,
			avatar_url: `https://i.pravatar.cc/150?img=${i % 3 + 1}`,
			is_verified: true,
			is_admin: false,
			account_status: "active",
			status_changed_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
	}));

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(generatePaginateResponse(mockUploads));
		}, 800);
	});
}

export default async function getEventUploads(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
