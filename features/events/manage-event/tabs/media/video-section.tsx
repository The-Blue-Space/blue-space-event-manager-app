"use client";

import { useState, useRef } from "react";
import { Video as VideoIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventMedia } from "@/types/event-media.types";
import VideoCard from "./video-card";
import { toast } from "sonner";

type VideoSectionProps = {
	video?: EventMedia | null;
	onUpload: (file: File) => Promise<void>;
	onReplace: (videoId: string, file: File) => Promise<void>;
	onDelete: (videoId: string) => Promise<void>;
	className?: string;
};

export default function VideoSection({
	video,
	onUpload,
	onReplace,
	onDelete,
	className,
}: VideoSectionProps) {
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("video/")) {
			toast.error("Please select a video file");
			return;
		}

		// Check file size (max 50MB)
		const maxSize = 50 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error("Video file size must be less than 50MB");
			return;
		}

		setIsUploading(true);
		try {
			await onUpload(file);
		} catch (error) {
			console.error("Upload error:", error);
		} finally {
			setIsUploading(false);
		}

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleReplace = async (file: File) => {
		if (video) {
			await onReplace(video.id, file);
		}
	};

	const handleDelete = async () => {
		if (video) {
			await onDelete(video.id);
		}
	};

	return (
		<div className={cn("border border-neutral-200 rounded-lg p-5 bg-white", className)}>
			<input
				ref={fileInputRef}
				type="file"
				accept="video/mp4,video/webm,video/quicktime"
				onChange={handleFileSelect}
				className="hidden"
			/>

			<h3 className="text-neutral-800 body-2 font-semibold mb-4">Video</h3>

			{/* Info message */}
			<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
				<VideoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
				<p className="text-sm text-blue-900">
					Video can only be one in any event media so you can either replace or delete
				</p>
			</div>

			{video ? (
				<VideoCard video={video} onReplace={handleReplace} onDelete={handleDelete} />
			) : (
				<div
					onClick={handleUploadClick}
					className={cn(
						"relative aspect-video border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
						isUploading && "opacity-50 cursor-not-allowed"
					)}
				>
					{isUploading ? (
						<>
							<Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-2" />
							<p className="text-sm font-medium text-neutral-700">Uploading video...</p>
						</>
					) : (
						<>
							<VideoIcon className="w-12 h-12 text-neutral-400 mb-2" />
							<p className="text-sm font-medium text-neutral-700 mb-1">No video uploaded</p>
							<p className="text-xs text-neutral-500">Click to upload video (MP4, WebM, MOV)</p>
							<p className="text-xs text-neutral-400 mt-1">Maximum file size: 50MB</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}
