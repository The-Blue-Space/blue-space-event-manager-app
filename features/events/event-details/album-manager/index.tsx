"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useCallback } from "react";
import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import { Upload, CheckSquare, X, Loader2, Trash2, Image, Video } from "lucide-react";
import { getEventUploads, uploadAlbumMedia } from "@/services/events/event-uploads";
import HighlightsSection from "./highlights-section";
import MediaGrid from "./media-grid";
import MediaLightbox from "./media-lightbox";
import useAlbumManager from "./use-album-manager";
import useCustomNavigation from "@/hooks/use-navigation";
import { toast } from "sonner";
import useAppSelector from "@/store/hooks";
import invalidateQuery from "@/lib/invalidate-query";
import { MediaType } from "@/types/event-upload.types";

type AlbumManagerProps = {
	eventId: string;
	open: boolean;
};

type FilePreview = {
	file: File;
	preview: string;
	type: MediaType;
};

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function AlbumManager({ eventId, open }: AlbumManagerProps) {
	const { queryParams } = useCustomNavigation();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
	const [filesToUpload, setFilesToUpload] = useState<FilePreview[]>([]);
	const [showPreview, setShowPreview] = useState(false);
	const { account } = useAppSelector("account");

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
		queryKey: ["event-uploads-all", eventId],
		queryFn: () => getEventUploads({ eventId, page: 1, limit: 100 }),
		enabled: open,
	});

	const allMedia = mediaData?.docs || [];
	const highlights = allMedia.filter((m) => m.is_highlight);

	const handleClose = () => {
		// Remove ?tab=album query param
		queryParams.deleteQueries(["tab"]);
		clearSelection();
		// Clear preview state
		clearFilePreviews();
	};

	const handleClickHighlight = (index: number) => {
		// Find the index in all media
		const highlight = highlights[index];
		const indexInAll = allMedia.findIndex((m) => m.id === highlight.id);
		openLightbox(indexInAll);
	};

	const getMediaType = (file: File): MediaType => {
		if (file.type.startsWith("video/")) return "video";
		return "image";
	};

	const clearFilePreviews = useCallback(() => {
		// Revoke object URLs to prevent memory leaks
		filesToUpload.forEach((fp) => URL.revokeObjectURL(fp.preview));
		setFilesToUpload([]);
		setShowPreview(false);
	}, [filesToUpload]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const fileArray = Array.from(files);
		const previews: FilePreview[] = fileArray.map((file) => ({
			file,
			preview: URL.createObjectURL(file),
			type: getMediaType(file),
		}));

		setFilesToUpload(previews);
		setShowPreview(true);

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeFileFromPreview = (index: number) => {
		const fileToRemove = filesToUpload[index];
		URL.revokeObjectURL(fileToRemove.preview);
		setFilesToUpload((prev) => prev.filter((_, i) => i !== index));

		// If no files left, close preview
		if (filesToUpload.length <= 1) {
			setShowPreview(false);
		}
	};

	const handleConfirmUpload = async () => {
		if (!account?.id) {
			toast.error("You must be logged in to upload media");
			return;
		}

		if (filesToUpload.length === 0) return;

		setIsUploading(true);
		setUploadProgress({ current: 0, total: filesToUpload.length });

		let successCount = 0;
		let failCount = 0;

		for (let i = 0; i < filesToUpload.length; i++) {
			const { file, type } = filesToUpload[i];
			setUploadProgress({ current: i + 1, total: filesToUpload.length });

			try {
				await uploadAlbumMedia({
					eventId,
					file,
					mediaType: type,
					uploadedById: account.id,
				});
				successCount++;
			} catch (error: any) {
				failCount++;
				console.error(`Failed to upload ${file.name}:`, error);
			}
		}

		setIsUploading(false);
		setUploadProgress({ current: 0, total: 0 });

		// Clear previews
		clearFilePreviews();

		// Invalidate queries to refresh the media list
		invalidateQuery(["event-uploads-all", eventId]);
		invalidateQuery(["event-uploads", eventId]);

		if (successCount > 0 && failCount === 0) {
			toast.success(`Successfully uploaded ${successCount} file(s)`);
		} else if (successCount > 0 && failCount > 0) {
			toast.warning(`Uploaded ${successCount} file(s), ${failCount} failed`);
		} else {
			toast.error("Failed to upload files");
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

						{!showPreview && (
							<AppButton
								variant="primary"
								leftIcon={<Upload className="w-4 h-4" />}
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploading}
							>
								Upload Media
							</AppButton>
						)}
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

					{/* Upload Preview Section */}
					{showPreview && filesToUpload.length > 0 && (
						<div className="border border-neutral-200 rounded-lg p-4 space-y-4 bg-neutral-50">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-neutral-900">
									Preview ({filesToUpload.length} file{filesToUpload.length > 1 ? "s" : ""})
								</h3>
								<div className="flex items-center gap-2">
									<AppButton
										variant="outline"
										size="sm"
										onClick={clearFilePreviews}
										disabled={isUploading}
									>
										Cancel
									</AppButton>
									<AppButton
										variant="primary"
										size="sm"
										onClick={handleConfirmUpload}
										disabled={isUploading}
										leftIcon={
											isUploading ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Upload className="w-4 h-4" />
											)
										}
									>
										{isUploading
											? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
											: "Confirm Upload"}
									</AppButton>
								</div>
							</div>

							{/* Preview Grid */}
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
								{filesToUpload.map((filePreview, index) => (
									<div
										key={index}
										className="relative group bg-white rounded-lg overflow-hidden border border-neutral-200"
									>
										{/* Preview Image/Video */}
										<div className="aspect-square relative">
											{filePreview.type === "video" ? (
												<div className="w-full h-full bg-neutral-900 flex items-center justify-center">
													<video
														src={filePreview.preview}
														className="w-full h-full object-cover"
													/>
													<div className="absolute inset-0 flex items-center justify-center bg-black/30">
														<Video className="w-8 h-8 text-white" />
													</div>
												</div>
											) : (
												<img
													src={filePreview.preview}
													alt={filePreview.file.name}
													className="w-full h-full object-cover"
												/>
											)}

											{/* Remove Button */}
											<button
												onClick={() => removeFileFromPreview(index)}
												disabled={isUploading}
												className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
											>
												<X className="w-3 h-3" />
											</button>

											{/* Type Badge */}
											<div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded flex items-center gap-1">
												{filePreview.type === "video" ? (
													<Video className="w-3 h-3" />
												) : (
													<Image className="w-3 h-3" />
												)}
												{filePreview.type}
											</div>
										</div>

										{/* File Info */}
										<div className="p-2">
											<p className="text-xs text-neutral-700 truncate" title={filePreview.file.name}>
												{filePreview.file.name}
											</p>
											<p className="text-xs text-neutral-500">
												{formatFileSize(filePreview.file.size)}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

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
