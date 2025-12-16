"use client";

import { EventUpload } from "@/types/event-upload.types";
import { Star } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type HighlightsSectionProps = {
	highlights: EventUpload[];
	onClickHighlight: (index: number) => void;
};

export default function HighlightsSection({
	highlights,
	onClickHighlight,
}: HighlightsSectionProps) {
	// Sort highlights by order
	const sortedHighlights = [...highlights].sort((a, b) => (a.order || 0) - (b.order || 0));

	// Fill empty slots up to 10
	const emptySlots = Math.max(0, 10 - sortedHighlights.length);

	return (
		<div className="space-y-3">
			<h3 className="font-semibold text-neutral-900">Highlights</h3>

			<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2">
				{/* Existing Highlights */}
				{sortedHighlights.map((media, index) => (
					<div
						key={media.id}
						className="relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border-2 border-accent-500 cursor-pointer hover:border-accent-600 transition-colors snap-start"
						onClick={() => onClickHighlight(index)}
					>
						<Image
							src={media.file_url}
							alt={media.file_name}
							fill
							className="object-cover"
							sizes="128px"
						/>
						<div className="absolute top-1 right-1">
							<Badge className="bg-accent-500 text-white border-none text-xs px-1.5 py-0.5">
								<Star className="w-3 h-3" />
							</Badge>
						</div>
						<div className="absolute bottom-1 left-1">
							<Badge className="bg-black/60 text-white border-none text-xs px-1.5 py-0.5">
								{index + 1}
							</Badge>
						</div>
					</div>
				))}

				{/* Empty Slots */}
				{Array.from({ length: emptySlots }).map((_, index) => (
					<div
						key={`empty-${index}`}
						className="flex-shrink-0 w-32 h-32 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50 snap-start"
					>
						<div className="text-center px-2">
							<Star className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
							<p className="text-xs text-neutral-400">Set as Highlight</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
