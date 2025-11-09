"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import { Upload, CheckSquare, X } from "lucide-react";
import getEventMedia from "@/services/events/get-event-media";
import HighlightsSection from "./highlights-section";
import MediaGrid from "./media-grid";
import MediaLightbox from "./media-lightbox";
import useAlbumManager from "./use-album-manager";
import useCustomNavigation from "@/hooks/use-navigation";
import { toast } from "sonner";

type AlbumManagerProps = {
	eventId: string;
	open: boolean;
};

export default function AlbumManager({ eventId, open }: AlbumManagerProps) {
	const { queryParams } = useCustomNavigation();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
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
	} = useAlbumManager({ eventId });

	// Fetch all media for lightbox (will use infinite scroll data)
	const { data: mediaData } = useQuery({
		queryKey: ["event-media-all", eventId],
		queryFn: () => getEventMedia({ eventId, page: 1, limit: 100 }),
		enabled: open,
	});

	const allMedia = mediaData?.docs || [];
	const highlights = allMedia.filter((m) => m.order > 0);

	const handleClose = () => {
		// Remove ?tab=album query param
		queryParams.deleteQueries(["tab"]);
		clearSelection();
	};

	const handleClickHighlight = (index: number) => {
		// Find the index in all media
		const highlight = highlights[index];
		const indexInAll = allMedia.findIndex((m) => m.id === highlight.id);
		openLightbox(indexInAll);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// TODO: Implement actual upload logic with service
		toast.info(`Selected ${files.length} file(s). Upload functionality coming soon.`);

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<AppDrawer
				title="Album Manager"
				open={open}
				direction="bottom"
				handleChange={handleClose}
				className="hide-scrollbar"
				showLogo={false}
			>
				<div className="p-6 space-y-6 h-full overflow-y-auto">
					{/* Header Actions */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<AppButton
								variant={isMultiSelectMode ? "primary" : "outline"}
								onClick={() => {
									setIsMultiSelectMode(!isMultiSelectMode);
									if (isMultiSelectMode) {
										clearSelection();
									}
								}}
								leftIcon={
									isMultiSelectMode ? (
										<X className="w-4 h-4" />
									) : (
										<CheckSquare className="w-4 h-4" />
									)
								}
							>
								{isMultiSelectMode ? `Cancel (${selectedMediaIds.length})` : "Select Multiple"}
							</AppButton>

							{isMultiSelectMode && selectedMediaIds.length > 0 && (
								<>
									<AppButton
										variant="outline"
										onClick={() => bulkSetAsHighlight(allMedia)}
										disabled={selectedMediaIds.length === 0}
									>
										Set as Highlights
									</AppButton>
									<AppButton
										variant="outline"
										onClick={bulkHide}
										disabled={selectedMediaIds.length === 0}
									>
										Hide Selected
									</AppButton>
									<AppButton
										variant="outline"
										onClick={() => deleteMedia(selectedMediaIds)}
										disabled={selectedMediaIds.length === 0}
										className="text-error-500"
									>
										Delete Selected
									</AppButton>
								</>
							)}
						</div>

						<AppButton
							variant="primary"
							leftIcon={<Upload className="w-4 h-4" />}
							onClick={() => fileInputRef.current?.click()}
						>
							Upload Media
						</AppButton>
					</div>

					{/* Hidden File Input */}
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
						multiple
						className="hidden"
						onChange={handleFileSelect}
					/>

					{/* Highlights Section */}
					{highlights.length > 0 && (
						<HighlightsSection highlights={highlights} onClickHighlight={handleClickHighlight} />
					)}

					{/* Media Grid */}
					<div className="space-y-3">
						<h3 className="font-semibold text-neutral-900">All Media</h3>
						<MediaGrid
							eventId={eventId}
							selectedMediaIds={selectedMediaIds}
							onToggleSelection={toggleMediaSelection}
							onClickMedia={(media) => {
								const index = allMedia.findIndex((m) => m.id === media.id);
								if (index !== -1) {
									openLightbox(index);
								}
							}}
							onSetHighlight={setAsHighlight}
							onToggleVisibility={toggleVisibility}
							onDelete={(mediaId) => deleteMedia([mediaId])}
							showCheckbox={isMultiSelectMode}
						/>
					</div>
				</div>
			</AppDrawer>

			{/* Lightbox - Only render when open and media is available */}
			{lightboxOpen && allMedia.length > 0 && (
				<MediaLightbox
					mediaList={allMedia}
					currentIndex={Math.min(lightboxIndex, allMedia.length - 1)}
					open={lightboxOpen}
					onClose={closeLightbox}
					onNavigate={setLightboxIndex}
					onSetHighlight={setAsHighlight}
					onToggleVisibility={toggleVisibility}
					onDelete={(mediaId) => deleteMedia([mediaId])}
				/>
			)}
		</>
	);
}
