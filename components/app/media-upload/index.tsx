"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import AppButton from "@/components/app/app-button";
import Image from "next/image";

type MediaUploadProps = {
	onUpload: (file: File) => void | Promise<void>;
	accept?: string;
	maxSize?: number; // in MB
	isLoading?: boolean;
	className?: string;
	showPreview?: boolean;
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export default function MediaUpload({
	onUpload,
	accept = "image/*,video/*",
	maxSize = 50, // 50MB default
	isLoading = false,
	className,
	showPreview = true,
}: MediaUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const validateFile = (file: File): string | null => {
		// Check file size
		const fileSizeMB = file.size / (1024 * 1024);
		if (fileSizeMB > maxSize) {
			return `File size must be less than ${maxSize}MB`;
		}

		// Check file type
		const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
		const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

		if (!isImage && !isVideo) {
			return "Only images (JPG, PNG, WebP) and videos (MP4, WebM) are allowed";
		}

		return null;
	};

	const handleFile = useCallback(
		(selectedFile: File) => {
			setError(null);

			const validationError = validateFile(selectedFile);
			if (validationError) {
				setError(validationError);
				return;
			}

			setFile(selectedFile);

			// Generate preview
			if (selectedFile.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreview(reader.result as string);
				};
				reader.readAsDataURL(selectedFile);
			} else if (selectedFile.type.startsWith("video/")) {
				setPreview("video");
			}
		},
		[maxSize]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);

			const droppedFile = e.dataTransfer.files[0];
			if (droppedFile) {
				handleFile(droppedFile);
			}
		},
		[handleFile]
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selectedFile = e.target.files?.[0];
			if (selectedFile) {
				handleFile(selectedFile);
			}
		},
		[handleFile]
	);

	const handleUpload = async () => {
		if (file) {
			await onUpload(file);
			// Clear after successful upload
			setFile(null);
			setPreview(null);
			setError(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleClear = () => {
		setFile(null);
		setPreview(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const openFilePicker = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className={cn("w-full", className)}>
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				onChange={handleFileInput}
				className="hidden"
				disabled={isLoading}
			/>

			{!file || !showPreview ? (
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onClick={openFilePicker}
					className={cn(
						"border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
						isDragging ? "border-primary-500 " : "border-neutral-300  bg-white",
						isLoading && "opacity-50 cursor-not-allowed"
					)}
				>
					<Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
					<p className="text-sm font-medium text-neutral-700 mb-1">
						Click to browse or drag and drop
					</p>
					<p className="text-xs text-neutral-500">Images (JPG, PNG, WebP) or Videos (MP4, WebM)</p>
					<p className="text-xs text-neutral-400 mt-1">Maximum file size: {maxSize}MB</p>
				</div>
			) : (
				<div className="border border-neutral-200 rounded-lg p-4 bg-white">
					{/* Preview */}
					<div className="flex items-start gap-4 mb-4">
						<div className="flex-shrink-0">
							{preview === "video" ? (
								<div className="w-20 h-20 bg-neutral-100 rounded flex items-center justify-center">
									<Video className="w-8 h-8 text-neutral-400" />
								</div>
							) : preview ? (
								<Image
									src={preview}
									alt="Preview"
									className="w-20 h-20 object-cover rounded"
									width={80}
									height={80}
								/>
							) : (
								<div className="w-20 h-20 bg-neutral-100 rounded flex items-center justify-center">
									<ImageIcon className="w-8 h-8 text-neutral-400" />
								</div>
							)}
						</div>

						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-neutral-900 truncate">{file.name}</p>
							<p className="text-xs text-neutral-500">
								{(file.size / (1024 * 1024)).toFixed(2)} MB
							</p>
							<p className="text-xs text-neutral-400 capitalize">{file.type.split("/")[0]} file</p>
						</div>

						<button
							onClick={handleClear}
							className="flex-shrink-0 p-1 hover:bg-neutral-100 rounded"
							disabled={isLoading}
						>
							<X className="w-4 h-4 text-neutral-500" />
						</button>
					</div>

					{/* Upload Button */}
					<div className="flex justify-center">
						<AppButton
							variant="primary"
							onClick={handleUpload}
							isLoading={isLoading}
							disabled={isLoading}
							className="w-56"
						>
							Upload Media
						</AppButton>
					</div>
				</div>
			)}

			{/* Error Message */}
			{error && <p className="text-xs text-red-600 mt-2">{error}</p>}
		</div>
	);
}
