import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useEvent } from "../../context";
import SectionWrapper from "../../section-wrapper";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AppButton from "@/components/app/app-button";
import deleteMedia from "@/services/events/event-media/delete-media";
import { useQuery } from "@tanstack/react-query";
import getMedias from "@/services/events/event-media/get-medias";
import ensureError from "@/lib/ensure-error";
import useAppSelector from "@/store/hooks";
import { compressImage } from "@/lib/compress-image";

export default function CoverImageSection() {
	const {account}= useAppSelector("account")
	const { event, uploadImages } = useEvent();
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: eventMedia, refetch } = useQuery({
		queryKey: ["event-medias-cover", event?.id],
		queryFn: () => getMedias({ event_Id: event?.id ?? "" }),
		enabled: !!event?.id,
	});

	const currentCoverImage = useMemo(
		() => eventMedia?.find((media) => media.media_type === "cover"),
		[eventMedia]
	);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		const compressed = await compressImage(file);
		if (compressed.size > 5 * 1024 * 1024) {
			toast.error("This image is too large to compress. Please choose a smaller file.");
			return;
		}
		setSelectedFile(compressed);
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewImage(reader.result as string);
		};
		reader.readAsDataURL(compressed);
	};

	const handleEditClick = () => {
		fileInputRef.current?.click();
	};

	const handleDeleteClick = async () => {
		setPreviewImage(null);
		setSelectedFile(null);
		if (currentCoverImage?.id) {
			try {
				setIsDeleting(true);
				await deleteMedia({ event_Id: event?.id ?? "", media_id: currentCoverImage.id, user_id:account.id });
				refetch();
				toast.success("Cover image removed");
			} catch (error) {
				const errMsg = ensureError(error).message;
				toast.error(errMsg || "Failed to delete cover image");
				throw error;
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleCancel = () => {
		setPreviewImage(null);
		setSelectedFile(null);
	};

	const handleSave = async () => {
		if (!selectedFile) {
			toast.error("Please select an image");
			return;
		}

		setIsLoading(true);
		try {
			await uploadImages([{ file: selectedFile, type: "cover" }]);
			toast.success("Cover image updated successfully");
			// setPreviewImage(null);
			// setSelectedFile(null);
			refetch();
		} catch (error) {
			toast.error("Failed to update cover image");
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const displayImage = previewImage || currentCoverImage?.url;

	return (
		<SectionWrapper
			title="Cover Image"
			icon={<ImageIcon className="w-5 h-5 text-primary-500" />}
			onSave={handleSave}
			showSaveButton={!!selectedFile}
			onCancel={handleCancel}
			isLoading={isLoading}
		>
			{(mode) => (
				<>
					{mode === "view" ? (
						<div className="space-y-3">
							{currentCoverImage?.url ? (
								<div className="relative w-full aspect-[7/3] rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
									<Image
										src={currentCoverImage.url}
										alt="Event cover"
										className="w-full h-full object-cover"
										width={2100}
										height={900}
									/>
								</div>
							) : (
								<div className="w-full aspect-[7/3] rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-3">
									<ImageIcon className="w-12 h-12 text-neutral-400" />
									<p className="body-3 text-neutral-500">No cover image uploaded</p>
								</div>
							)}
							<p className="text-xs text-neutral-500">
								📐 Recommended: 2100x900px (7:3 aspect ratio)
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{/* Image with Overlay */}
							<div className="relative w-full aspect-[7/3] rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 group">
								{displayImage ? (
									<Image
										src={displayImage}
										alt="Cover preview"
										className="w-full h-full object-cover"
										width={2100}
										height={900}
									/>
								) : (
									<div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50">
										<ImageIcon className="w-12 h-12 text-neutral-400 mb-2" />
										<p className="body-3 text-neutral-500">No cover image</p>
									</div>
								)}

								{/* Hover Overlay with Edit/Delete buttons */}
								<div
									className={cn(
										"absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
										"flex items-center justify-center gap-4"
									)}
								>
									<AppButton
										variant="black"
										onClick={handleEditClick}
										disabled={isLoading}
										className="size-10"
										type="button"
										leftIcon={<Pencil className="w-4 h-4 text-white" />}
									>
										Edit
									</AppButton>

									{displayImage && (
										<AppButton
											variant="destructive"
											onClick={handleDeleteClick}
											disabled={isDeleting}
											isLoading={isDeleting}
											className="size-10"
											type="button"
											leftIcon={<Trash2 className="w-4 h-4 text-white" />}
										>
											Delete
										</AppButton>
									)}
								</div>

								{/* Hidden File Input */}
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileSelect}
									className="hidden"
								/>
							</div>

							<p className="text-xs text-neutral-500">
								📐 Recommended: 2100x900px (7:3 aspect ratio) • Max size: 5MB
							</p>
						</div>
					)}
				</>
			)}
		</SectionWrapper>
	);
}
