"use client";

import { useState, useRef } from "react";
import { Play, MoreVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventMedia } from "@/types/event-media.types";

type VideoCardProps = {
	video: EventMedia;
	onReplace: (file: File) => Promise<void>;
	onDelete: () => Promise<void>;
	className?: string;
};

export default function VideoCard({ video, onReplace, onDelete, className }: VideoCardProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleReplace = () => {
		fileInputRef.current?.click();
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type.startsWith("video/")) {
			setIsLoading(true);
			try {
				await onReplace(file);
			} catch (error) {
				console.error("Replace error:", error);
			} finally {
				setIsLoading(false);
			}
		}
		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDelete = async () => {
		setIsLoading(true);
		try {
			await onDelete();
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const togglePlay = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	return (
		<div
			className={cn(
				"relative aspect-video rounded-lg overflow-hidden bg-neutral-900 group",
				className
			)}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="video/*"
				onChange={handleFileSelect}
				className="hidden"
			/>

			{/* Video Player */}
			<video
				ref={videoRef}
				src={video.url}
				className="w-full h-full object-cover"
				onEnded={() => setIsPlaying(false)}
			/>

			{/* Play Overlay */}
			{!isPlaying && !isLoading && (
				<div
					onClick={togglePlay}
					className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
				>
					<div className="bg-white rounded-full p-4">
						<Play className="w-8 h-8 text-neutral-900" fill="currentColor" />
					</div>
				</div>
			)}

			{/* Loading Overlay */}
			{isLoading && (
				<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<Loader2 className="w-8 h-8 text-white animate-spin" />
				</div>
			)}

			{/* Actions Dropdown */}
			{!isLoading && (
				<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<AppDropdown
						trigger={
							<button className="p-1.5 bg-white rounded shadow hover:bg-neutral-50">
								<MoreVertical className="w-4 h-4 text-neutral-700" />
							</button>
						}
						modal
						align="end"
					>
						<DropdownMenuItem onClick={handleReplace}>Replace Video</DropdownMenuItem>
						<DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
							Delete Video
						</DropdownMenuItem>
					</AppDropdown>
				</div>
			)}

			{/* File Info (on hover) */}
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
				<p className="text-xs text-white truncate">{video.file_name}</p>
				<p className="text-xs text-neutral-300">
					{(video.file_size / (1024 * 1024)).toFixed(2)} MB
				</p>
			</div>
		</div>
	);
}
