"use client";

import { Image as ImageIcon } from "lucide-react";
import { EventMedia } from "@/types/event-media.types";
import Image from "next/image";

type CoverImageSectionProps = {
	coverMedia?: EventMedia | null;
	onUploadClick?: () => void;
	className?: string;
};

export default function CoverImageSection({
	coverMedia,
	onUploadClick,
	
}: CoverImageSectionProps) {
	return (
		<div >
			<h3 className="text-neutral-800 body-2 font-semibold mb-4">Cover Image</h3>

			{coverMedia ? (
				<div className="relative aspect-[7/3] w-full bg-neutral-100 rounded-lg overflow-hidden">
					<Image
						src={coverMedia.url}
						alt={coverMedia.file_name}
						className="w-full h-full object-cover"
						width={2100}
						height={900}
					/>
				</div>
			) : (
				<div
					onClick={onUploadClick}
					className="relative aspect-[7/3] w-full border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
				>
					<ImageIcon className="w-16 h-16 text-neutral-400 mb-3" />
					<p className="text-sm font-medium text-neutral-700 mb-1">No cover image set</p>
					<p className="text-xs text-neutral-500">Click to upload or select from media below</p>
				</div>
			)}
		</div>
	);
}
