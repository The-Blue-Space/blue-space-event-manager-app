"use client";

import { useState, useRef } from "react";
import { MoreVertical, Loader2, ImageUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventMedia } from "@/types/event-media.types";
import Image from "next/image";

type MediaAction = "set-cover" | "replace" | "delete";

type MediaCardProps = {
	media?: EventMedia | null;
	isPlaceholder?: boolean;
	onAction?: (action: MediaAction, media?: EventMedia, file?: File) => void | Promise<void>;
	onUploadClick?: () => void;
	isDraggable?: boolean;
	isUploading?: boolean;
	className?: string;
};

export default function MediaCard({
	media,
	isPlaceholder = false,
	onAction,
	onUploadClick,
	isDraggable = false,
	isUploading = false,
	className,
}: MediaCardProps) {
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleAction = async (action: MediaAction) => {
		if (!media || !onAction) return;

		if (action === "replace") {
			// Delay file input click to allow dropdown to close first
			setTimeout(() => {
				fileInputRef.current?.click();
			}, 100);
			return;
		}

		setIsLoading(true);
		try {
			await onAction(action, media);
		} catch (error) {
			console.error("Media action error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && media && onAction) {
			setIsLoading(true);
			try {
				await onAction("replace", media, file);
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

	// Placeholder card
	if (isPlaceholder || !media) {
		return (
			<div
				onClick={isUploading ? undefined : onUploadClick}
				className={cn(
					"relative aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center transition-colors",
					!isUploading && "cursor-pointer hover:border-neutral-400 hover:bg-neutral-50",
					isUploading && "cursor-not-allowed opacity-75",
					className
				)}
			>
				{isUploading ? (
					<>
						<Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
						<p className="text-xs text-neutral-500 mt-2">Uploading...</p>
					</>
				) : (
					<ImageUpIcon className="w-12 h-12 text-neutral-200" />
				)}
			</div>
		);
	}

	const isCover = media.media_type === "cover";

	return (
		<div
			className={cn(
				"relative aspect-square border border-neutral-200 rounded-lg overflow-hidden bg-white group",
				isDraggable && "cursor-move",
				className
			)}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/gif"
				onChange={handleFileSelect}
				className="hidden"
			/>

			{/* Media Display */}
			<div className="w-full h-full">
				<Image
					src={media.url}
					alt={media.file_name}
					className="w-full h-full object-cover"
					width={100}
					height={100}
				/>
			</div>

			{/* Cover Badge */}
			{isCover && (
				<div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
					Cover
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
				<div
					className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
					onPointerDown={(e) => e.stopPropagation()}
					onClick={(e) => e.stopPropagation()}
				>
					<AppDropdown
						trigger={
							<button className="p-1.5 bg-white rounded shadow hover:bg-neutral-50">
								<MoreVertical className="w-4 h-4 text-neutral-700" />
							</button>
						}
						modal
						align="end"
					>
						{!isCover && (
							<DropdownMenuItem onClick={() => handleAction("set-cover")}>
								Set as Cover
							</DropdownMenuItem>
						)}

						<DropdownMenuItem onClick={() => handleAction("replace")}>
							Replace Media
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => handleAction("delete")}
							className="text-red-600 focus:text-red-600"
						>
							Delete
						</DropdownMenuItem>
					</AppDropdown>
				</div>
			)}

			{/* File Info (on hover) */}
			<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<p className="text-xs text-white truncate">{media.file_name}</p>
				<p className="text-xs text-neutral-300">
					{(media.file_size / (1024 * 1024)).toFixed(2)} MB
				</p>
			</div>
		</div>
	);
}
