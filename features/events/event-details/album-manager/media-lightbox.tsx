"use client";

import { EventMedia } from "@/types/event-media.types";
import { X, ChevronLeft, ChevronRight, Star, EyeOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useCallback } from "react";
import AppButton from "@/components/app/app-button";

type MediaLightboxProps = {
	mediaList: EventMedia[];
	currentIndex: number;
	open: boolean;
	onClose: () => void;
	onNavigate: (newIndex: number) => void;
	onSetHighlight: (mediaId: string, currentOrder: number) => void;
	onToggleVisibility: (mediaId: string, isActive: boolean) => void;
	onDelete: (mediaId: string) => void;
};

export default function MediaLightbox({
	mediaList,
	currentIndex,
	open,
	onClose,
	onNavigate,
	onSetHighlight,
	onToggleVisibility,
	onDelete,
}: MediaLightboxProps) {
	const currentMedia = mediaList[currentIndex];

	const handlePrevious = useCallback(() => {
		if (currentIndex > 0) {
			onNavigate(currentIndex - 1);
		}
	}, [currentIndex, onNavigate]);

	const handleNext = useCallback(() => {
		if (currentIndex < mediaList.length - 1) {
			onNavigate(currentIndex + 1);
		}
	}, [currentIndex, mediaList.length, onNavigate]);

	// Keyboard navigation
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowLeft") {
				handlePrevious();
			} else if (e.key === "ArrowRight") {
				handleNext();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose, handlePrevious, handleNext]);

	if (!open || !currentMedia) return null;

	const isVideo = currentMedia.media_type === "video";
	const isHighlight = currentMedia.order > 0;

	return (
		<div
			className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
			onClick={(e) => {
				// Close lightbox when clicking the backdrop
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			{/* Close Button */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-50"
			>
				<X className="w-6 h-6 text-white" />
			</button>

			{/* Media Counter */}
			<div className="absolute top-4 left-4 px-3 py-1.5 bg-white/10 rounded-lg">
				<p className="text-sm text-white font-medium">
					{currentIndex + 1} / {mediaList.length}
				</p>
			</div>

			{/* Navigation Buttons */}
			{currentIndex > 0 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						handlePrevious();
					}}
					className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-50"
				>
					<ChevronLeft className="w-6 h-6 text-white" />
				</button>
			)}

			{currentIndex < mediaList.length - 1 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						handleNext();
					}}
					className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-50"
				>
					<ChevronRight className="w-6 h-6 text-white" />
				</button>
			)}

			{/* Media Display */}
			<div className="w-full h-full flex items-center justify-center p-20">
				{isVideo ? (
					<video
						src={currentMedia.url}
						controls
						autoPlay
						className="max-w-full max-h-full rounded-lg"
					/>
				) : (
					<div className="relative w-full h-full">
						<Image
							src={currentMedia.url}
							alt={currentMedia.file_name}
							fill
							className="object-contain"
							sizes="100vw"
							priority
						/>
					</div>
				)}
			</div>

			{/* Action Bar */}
			<div
				className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg z-50"
				onClick={(e) => e.stopPropagation()}
			>
				<AppButton
					variant={"outline"}
					onClick={(e) => {
						e.stopPropagation();
						onSetHighlight(currentMedia.id, currentMedia.order);
					}}
					leftIcon={<Star className="w-4 h-4 text-accent-500" />}
					className="text-white"
				>
					{isHighlight ? "Remove Highlight" : "Set as Highlight"}
				</AppButton>

				<AppButton
					variant="outline"
					className="text-white"
					onClick={(e) => {
						e.stopPropagation();
						onToggleVisibility(currentMedia.id, currentMedia.is_active);
					}}
					leftIcon={<EyeOff className="w-4 h-4" />}
				>
					{currentMedia.is_active ? "Hide" : "Show"}
				</AppButton>

				<AppButton
					variant="outline"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(currentMedia.id);
						if (mediaList.length > 1) {
							// Navigate to next or previous media after delete
							if (currentIndex < mediaList.length - 1) {
								onNavigate(currentIndex);
							} else {
								onNavigate(currentIndex - 1);
							}
						} else {
							onClose();
						}
					}}
					leftIcon={<Trash2 className="w-4 h-4" />}
					className="text-error-500 hover:text-error-600"
				>
					Delete
				</AppButton>
			</div>
		</div>
	);
}
