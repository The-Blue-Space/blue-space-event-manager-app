import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useEvent } from "../../context";
import SectionWrapper from "../../section-wrapper";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AppButton from "@/components/app/app-button";

export default function CoverImageSection() {
	const { event, uploadImages } = useEvent();
	const [isLoading, setIsLoading] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const currentCoverImage = useMemo(
		() => event?.event_media?.find((media) => media.media_type === "cover"),
		[event]
	);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}

		setSelectedFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreviewImage(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleEditClick = () => {
		fileInputRef.current?.click();
	};

	const handleDeleteClick = () => {
		setPreviewImage(null);
		setSelectedFile(null);
		// TODO: Call API to delete cover image from server
		toast.success("Cover image removed");
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
			setPreviewImage(null);
			setSelectedFile(null);
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
											disabled={isLoading}
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
