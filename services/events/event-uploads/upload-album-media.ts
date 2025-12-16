import { variables } from "@/constants";
import axios from "@/lib/axios";
import { buildFormData } from "@/lib/build-form-data";
import { EventUpload, MediaType } from "@/types/event-upload.types";

type Parameters = {
	eventId: string;
	file: File;
	mediaType: MediaType;
	uploadedById: string;
};

type Response = {
	message: string;
	data: EventUpload;
};

export async function production(params: Parameters): Promise<Response> {
	const formData = buildFormData({
		file: params.file,
		media_type: params.mediaType === "image" ? "photo" : params.mediaType,
		uploaded_by_id: params.uploadedById,
	});

	const response = await axios.post(`/v1/media/event/${params.eventId}/upload`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Mock data for development
	const mockUpload: EventUpload = {
		id: `upload-${Date.now()}`,
		album_id: "album-1",
		uploaded_by_id: params.uploadedById,
		media_type: params.mediaType,
		file_url: URL.createObjectURL(params.file),
		mime_type: params.file.type,
		file_size: params.file.size,
		file_name: params.file.name,
		public_id: `event-uploads/${Date.now()}`,
		uploaded_at: new Date().toISOString(),
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		is_highlight: false,
		is_hidden: false,
		order: 0,
		is_active: true,
		deleted_at: null,
	};

	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					message: "Media uploaded successfully",
					data: mockUpload,
				}),
			1500
		);
	});
}

export default async function uploadAlbumMedia(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
