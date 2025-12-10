"use client";

import { EventUpload } from "@/types/event-upload.types";
import { Badge } from "@/components/ui/badge";
import AppCheckbox from "@/components/app/app-checkbox";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Star, EyeOff, Trash2, MoreVertical, Play } from "lucide-react";
import Image from "next/image";

type MediaCardProps = {
	media: EventUpload;
	isSelected: boolean;
	onSelect: () => void;
	onClick: (media: EventUpload) => void;
	onSetHighlight: () => void;
	onToggleVisibility: () => void;
	onDelete: () => void;
	showCheckbox: boolean;
};

export default function MediaCard({
	media,
	isSelected,
	onSelect,
	onClick,
	onSetHighlight,
	onToggleVisibility,
	onDelete,
	showCheckbox,
}: MediaCardProps) {
	const isHighlight = (media.order || 0) > 0;
	const isVideo = media.media_type === "video";
	const isActive = media.is_active !== undefined ? media.is_active : true;

	return (
		<div className="relative group rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer">
			{/* Checkbox (Top-Left) */}
			{showCheckbox && (
				<div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
					<AppCheckbox
						checked={isSelected}
						onCheckedChange={(checked) => {
							onSelect();
						}}
					/>
				</div>
			)}

			{/* Dropdown Menu (Top-Right) */}
			<div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
				<AppDropdown
					trigger={
						<button
							className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreVertical className="w-4 h-4 text-neutral-600" />
						</button>
					}
					align="end"
					position="bottom"
				>
					<DropdownMenuItem onClick={onSetHighlight}>
						<Star className="w-4 h-4 mr-2" />
						{isHighlight ? "Remove Highlight" : "Set as Highlight"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onToggleVisibility}>
						<EyeOff className="w-4 h-4 mr-2" />
						{isActive ? "Hide" : "Show"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onDelete} className="text-error-500">
						<Trash2 className="w-4 h-4 mr-2" />
						Delete
					</DropdownMenuItem>
				</AppDropdown>
			</div>

			{/* Media Thumbnail */}
			<div className="relative aspect-square bg-neutral-100" onClick={() => onClick(media)}>
				{isVideo ? (
					<>
						<video src={media.file_url} className="w-full h-full object-cover" />
						<div className="absolute inset-0 flex items-center justify-center bg-black/20">
							<div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
								<Play className="w-6 h-6 text-neutral-900" />
							</div>
						</div>
					</>
				) : (
					<Image
						src={media.file_url}
						alt={media.file_name}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 50vw, 25vw"
					/>
				)}
			</div>

			{/* Badges (Bottom) */}
			<div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
				{isHighlight && (
					<Badge variant="secondary" className="bg-accent-500 text-white border-none text-xs">
						<Star className="w-3 h-3 mr-1" />
						Highlight
					</Badge>
				)}
				{!isActive && (
					<Badge variant="secondary" className="bg-neutral-800 text-white border-none text-xs">
						<EyeOff className="w-3 h-3 mr-1" />
						Hidden
					</Badge>
				)}
			</div>
		</div>
	);
}
