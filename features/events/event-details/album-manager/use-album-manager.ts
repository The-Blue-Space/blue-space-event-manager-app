import { useState, useCallback } from "react";
import { EventMedia } from "@/types/event-media.types";
import updateEventMedia from "@/services/events/update-event-media";
import deleteEventMedia from "@/services/events/delete-event-media";
import { toast } from "sonner";
import invalidateQuery from "@/lib/invalidate-query";
import useActions from "@/store/actions";

type UseAlbumManagerProps = {
	eventId: string;
};

export default function useAlbumManager({ eventId }: UseAlbumManagerProps) {
	const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
	const { ui } = useActions();

	const toggleMediaSelection = useCallback((mediaId: string) => {
		setSelectedMediaIds((prev) =>
			prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
		);
	}, []);

	const clearSelection = useCallback(() => {
		setSelectedMediaIds([]);
		setIsMultiSelectMode(false);
	}, []);

	const openLightbox = useCallback((index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	}, []);

	const closeLightbox = useCallback(() => {
		setLightboxOpen(false);
	}, []);

	const setAsHighlight = useCallback(
		async (mediaId: string, currentOrder: number) => {
			try {
				// Get next available order (1-10)
				const newOrder = currentOrder === 0 ? 1 : 0; // Toggle highlight
				await updateEventMedia({
					eventId,
					mediaId,
					order: newOrder,
				});
				toast.success(newOrder > 0 ? "Set as highlight" : "Removed from highlights");
				invalidateQuery(["event-media"]);
			} catch (error: any) {
				toast.error(error?.message || "Failed to update media");
			}
		},
		[eventId]
	);

	const toggleVisibility = useCallback(
		async (mediaId: string, isActive: boolean) => {
			try {
				await updateEventMedia({
					eventId,
					mediaId,
					isActive: !isActive,
				});
				toast.success(isActive ? "Media hidden" : "Media shown");
				invalidateQuery(["event-media"]);
			} catch (error: any) {
				toast.error(error?.message || "Failed to update media");
			}
		},
		[eventId]
	);

	const deleteMedia = useCallback(
		(mediaIds: string[]) => {
			ui.changeDialog({
				show: true,
				type: "delete_dialog",
				staticData: {
					title: "Delete Media",
					text: `Are you sure you want to delete ${
						mediaIds.length === 1 ? "this media" : `${mediaIds.length} media items`
					}? This action cannot be undone.`,
					showTitle: true,
					showText: true,
					showActionButton: true,
					showDismissButton: true,
					actionButtonText: "Delete",
					dismissButtonText: "Cancel",
					dismissAfterAction: true,
				},
				action: async () => {
					try {
						await deleteEventMedia({ eventId, mediaIds });
						toast.success("Media deleted successfully");
						invalidateQuery(["event-media"]);
						clearSelection();
					} catch (error: any) {
						toast.error(error?.message || "Failed to delete media");
					}
				},
			});
		},
		[eventId, ui, clearSelection]
	);

	const bulkSetAsHighlight = useCallback(
		async (mediaList: EventMedia[]) => {
			try {
				const highlightedCount = mediaList.filter((m) => m.order > 0).length;
				const availableSlots = 10 - highlightedCount;

				if (selectedMediaIds.length > availableSlots) {
					toast.error(`Only ${availableSlots} highlight slots available`);
					return;
				}

				// Find next available order numbers
				const usedOrders = mediaList.filter((m) => m.order > 0).map((m) => m.order);
				let nextOrder = 1;

				for (const mediaId of selectedMediaIds) {
					while (usedOrders.includes(nextOrder)) {
						nextOrder++;
					}
					await updateEventMedia({
						eventId,
						mediaId,
						order: nextOrder,
					});
					usedOrders.push(nextOrder);
					nextOrder++;
				}

				toast.success(`${selectedMediaIds.length} media set as highlights`);
				invalidateQuery(["event-media"]);
				clearSelection();
			} catch (error: any) {
				toast.error(error?.message || "Failed to update media");
			}
		},
		[eventId, selectedMediaIds, clearSelection]
	);

	const bulkHide = useCallback(async () => {
		try {
			for (const mediaId of selectedMediaIds) {
				await updateEventMedia({
					eventId,
					mediaId,
					isActive: false,
				});
			}
			toast.success(`${selectedMediaIds.length} media hidden`);
			invalidateQuery(["event-media"]);
			clearSelection();
		} catch (error: any) {
			toast.error(error?.message || "Failed to hide media");
		}
	}, [eventId, selectedMediaIds, clearSelection]);

	return {
		selectedMediaIds,
		isMultiSelectMode,
		setIsMultiSelectMode,
		toggleMediaSelection,
		clearSelection,
		lightboxOpen,
		lightboxIndex,
		setLightboxIndex,
		openLightbox,
		closeLightbox,
		setAsHighlight,
		toggleVisibility,
		deleteMedia,
		bulkSetAsHighlight,
		bulkHide,
	};
}
