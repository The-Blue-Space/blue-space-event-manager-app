"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEvent } from "../../context";
import { EventMedia, EventMediaType } from "@/types/event-media.types";
import TabContainer from "../../tab-container";
import CoverImageSection from "./cover-image-section";
import ActiveMediaGrid from "./active-media-grid";
import VideoSection from "./video-section";
import getMedias from "@/services/events/event-media/get-medias";
import addMedia from "@/services/events/event-media/add-media";
import updateMedia from "@/services/events/event-media/update-media";
import deleteMedia from "@/services/events/event-media/delete-media";
import replaceMedia from "@/services/events/event-media/replace-media";
import ensureError from "@/lib/ensure-error";

export default function Media() {
	const { event } = useEvent();
	const queryClient = useQueryClient();

	// Fetch media
	const { data: allMedia = [] } = useQuery({
		queryKey: ["event-media", event?.id],
		queryFn: () => getMedias({ event_Id: event!.id }),
		enabled: !!event?.id,
	});

	// Separate media into categories
	const { coverMedia, activeMedia, videoMedia } = useMemo(() => {
		const cover = allMedia.find((m) => m.media_type === "cover");
		const video = allMedia.find((m) => m.media_type === "video");

		// Get all image media (excluding cover and video), max 6
		const active = allMedia
			.filter((m) => m.media_type === "image")
			.sort((a, b) => a.order - b.order)
			.slice(0, 6);

		return {
			coverMedia: cover,
			activeMedia: active,
			videoMedia: video,
		};
	}, [allMedia]);

	// Invalidate queries helper
	const invalidateMediaQueries = () => {
		queryClient.invalidateQueries({ queryKey: ["event-media", event?.id] });
	};

	// Add media handler (for images only)
	const handleAddMedia = async (file: File) => {
		if (!event?.id) {
			toast.error("Event ID is required");
			return;
		}

		// Validate image type
		const validTypes = ["image/jpeg", "image/png", "image/gif"];
		if (!validTypes.includes(file.type)) {
			toast.error("Only JPEG, PNG, and GIF images are allowed");
			return;
		}

		// Check if we already have 6 images
		if (activeMedia.length >= 6) {
			toast.error("Maximum 6 media items allowed. Please replace an existing one.");
			return;
		}

		try {
			const media_type: EventMediaType = allMedia.length === 0 ? "cover" : "image";
			const order = activeMedia.length + 1;

			await addMedia({
				event_Id: event.id,
				media_type,
				is_active: true,
				order,
				file,
			});

			toast.success("Media uploaded successfully");
			invalidateMediaQueries();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to upload media");
			throw error;
		}
	};

	// Update media handler
	const handleUpdateMedia = async (
		media_id: string,
		is_active: boolean,
		order: number,
		media_type?: EventMediaType
	) => {
		if (!event?.id) {
			toast.error("Event ID is required");
			return;
		}

		try {
			await updateMedia({
				event_Id: event.id,
				media_id,
				is_active,
				order,
				media_type,
			});

			toast.success("Media updated successfully");
			invalidateMediaQueries();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to update media");
			throw error;
		}
	};

	// Delete media handler
	const handleDeleteMedia = async (media_id: string) => {
		if (!event?.id) {
			toast.error("Event ID is required");
			return;
		}

		try {
			await deleteMedia({
				event_Id: event.id,
				media_id,
			});

			toast.success("Media deleted successfully");
			invalidateMediaQueries();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to delete media");
			throw error;
		}
	};

	// Replace media handler (images only, video replacement is handled in VideoSection)
	const handleReplaceMedia = async (media_id: string, file: File) => {
		if (!event?.id) {
			toast.error("Event ID is required");
			return;
		}

		// Validate image type for image replacements
		if (file.type.startsWith("image/")) {
			const validTypes = ["image/jpeg", "image/png", "image/gif"];
			if (!validTypes.includes(file.type)) {
				toast.error("Only JPEG, PNG, and GIF images are allowed");
				return;
			}
		}

		try {
			await replaceMedia({
				event_Id: event.id,
				media_id,
				file,
			});

			toast.success("Media replaced successfully");
			invalidateMediaQueries();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to replace media");
			throw error;
		}
	};

	// Handle media actions
	const handleMediaAction = async (action: string, media?: EventMedia, file?: File) => {
		if (!media) return;

		switch (action) {
			case "set-cover":
				// Update old cover to regular image
				if (coverMedia) {
					await handleUpdateMedia(coverMedia.id, true, coverMedia.order, "image");
				}

				// Set new cover - stays in current position, just changes type
				await handleUpdateMedia(media.id, true, media.order, "cover");
				break;

			case "replace":
				if (file) {
					await handleReplaceMedia(media.id, file);
				}
				break;

			case "delete":
				await handleDeleteMedia(media.id);
				break;

			default:
				break;
		}
	};

	// Handle reordering of active media
	const handleReorder = async (reorderedMedia: EventMedia[]) => {
		// Update order for all reordered media
		const updates = reorderedMedia.map((media, index) =>
			handleUpdateMedia(media.id, true, index + 1)
		);

		await Promise.all(updates);
	};

	return (
		<TabContainer value="medias">
			<div className="space-y-6">
				{/* Cover Image & Active Media Section */}
				<div className="border border-neutral-200 rounded-lg p-5 bg-white space-y-4">
					<CoverImageSection coverMedia={coverMedia} onUploadClick={() => {}} />
					<ActiveMediaGrid
						media={activeMedia}
						onReorder={handleReorder}
						onAction={handleMediaAction}
						onAddMedia={handleAddMedia}
					/>
				</div>

				{/* Video Section */}
				<VideoSection
					video={videoMedia}
					onUpload={async (file) => {
						// Video upload is handled separately in VideoSection
						if (!event?.id) return;

						try {
							const existingVideo = allMedia.find((m) => m.media_type === "video");
							if (existingVideo) {
								await replaceMedia({
									event_Id: event.id,
									media_id: existingVideo.id,
									file,
								});
								toast.success("Video replaced successfully");
							} else {
								await addMedia({
									event_Id: event.id,
									media_type: "video",
									is_active: true,
									order: 0,
									file,
								});
								toast.success("Video uploaded successfully");
							}
							invalidateMediaQueries();
						} catch (error) {
							const errMsg = ensureError(error).message;
							toast.error(errMsg || "Failed to upload video");
						}
					}}
					onReplace={async (videoId, file) => {
						await handleReplaceMedia(videoId, file);
					}}
					onDelete={async (videoId) => {
						await handleDeleteMedia(videoId);
					}}
				/>
			</div>
		</TabContainer>
	);
}
