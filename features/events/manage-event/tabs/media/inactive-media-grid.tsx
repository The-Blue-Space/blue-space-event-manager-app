"use client";

import { EventMedia } from "@/types/event-media.types";
import MediaCard from "./media-card";
import { cn } from "@/lib/utils";

type InactiveMediaGridProps = {
	media: EventMedia[];
	onAction: (action: string, media?: EventMedia) => void | Promise<void>;
	className?: string;
};

export default function InactiveMediaGrid({ media, onAction, className }: InactiveMediaGridProps) {
	if (media.length === 0) {
		return null;
	}

	// Show placeholders to fill up to 6 slots if less than 6 items
	const placeholderCount = media.length < 6 ? 6 - media.length : 0;
	const placeholders = Array.from({ length: placeholderCount }, (_, i) => i);

	return (
		<div className={cn("border border-neutral-200 rounded-lg p-5 bg-white", className)}>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-neutral-800 body-2 font-semibold">Inactive Media</h3>
				<p className="text-xs text-neutral-500">
					{media.length} {media.length === 1 ? "item" : "items"}
				</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
				{media.map((item) => (
					<MediaCard key={item.id} media={item} onAction={onAction} isDraggable={false} />
				))}

				{/* Placeholder slots for visual consistency */}
				{placeholders.map((index) => (
					<div
						key={`placeholder-${index}`}
						className="aspect-square border border-neutral-100 rounded-lg bg-neutral-50"
					/>
				))}
			</div>

			<p className="text-xs text-neutral-500 mt-3">
				Inactive media won&apos;t appear in the event gallery. Mark as active to include them.
			</p>
		</div>
	);
}
