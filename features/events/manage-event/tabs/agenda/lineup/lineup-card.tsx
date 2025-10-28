"use client";

import { MoreVertical, Star, Clock, GripVertical, User2 } from "lucide-react";
import Image from "next/image";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventLineup } from "@/types/event-agenda.types";
import { cn } from "@/lib/utils";
import AppTooltip from "@/components/app/app-tooltip";

type LineupCardProps = {
	lineup: EventLineup;
	onEdit: (lineup: EventLineup) => void;
	onDelete: (lineupId: string) => void;
	isDraggable?: boolean;
};

export default function LineupCard({
	lineup,
	onEdit,
	onDelete,
	isDraggable = false,
}: LineupCardProps) {
	const formatTime = (time: string) => {
		const [hours, minutes] = time.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const formatTimeRange = () => {
		if (!lineup.start_time) return null;
		if (!lineup.end_time) return formatTime(lineup.start_time);
		return `${formatTime(lineup.start_time)} - ${formatTime(lineup.end_time)}`;
	};

	return (
		<Card
			className={cn(
				"relative bg-white border border-neutral-200 rounded-lg p-4 transition-all duration-200 group hover:shadow-md ",
				isDraggable && "cursor-move"
			)}
		>
			{lineup.is_headliner && (
				<Badge
					variant="default"
					className="absolute top-0 right-0 flex items-center gap-1 px-2 py-1 text-xs bg-primary-500 text-white rounded-none rounded-tr-lg"
				>
					<AppTooltip
						trigger={
							<div className="cursor-pointer">
								<Star className="w-3 h-3" />
							</div>
						}
					>
						<p className="body-3">Headliner</p>
					</AppTooltip>
				</Badge>
			)}
			<div className="flex items-start gap-4">
				{/* Artist Image */}
				<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
					{lineup.artist_image_url ? (
						<Image
							src={lineup.artist_image_url}
							alt={lineup.artist_name}
							fill
							className="object-cover body-4"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-neutral-400">
							<User2 className="size-10" />
						</div>
					)}
				</div>

				{/* Artist Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="body-2 font-semibold text-primary-500 truncate">{lineup.artist_name}</h3>
					</div>

					{formatTimeRange() && (
						<div className="flex items-center gap-1 body-3 text-neutral-600">
							<Clock className="w-3 h-3 text-primary-500" />
							<span>{formatTimeRange()}</span>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					{isDraggable && (
						<div className="opacity-0 group-hover:opacity-100 transition-opacity">
							<GripVertical className="w-4 h-4 text-neutral-400 cursor-move" />
						</div>
					)}

					<div className="opacity-0 group-hover:opacity-100 transition-opacity">
						<AppDropdown
							trigger={
								<button className="p-1 hover:bg-neutral-100 rounded transition-colors">
									<MoreVertical className="w-4 h-4 text-neutral-600" />
								</button>
							}
							align="end"
						>
							<DropdownMenuItem onClick={() => onEdit(lineup)}>Edit</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDelete(lineup.id)}
								className="text-red-600 focus:text-red-600"
							>
								Delete
							</DropdownMenuItem>
						</AppDropdown>
					</div>
				</div>
			</div>
			{lineup.notes && (
				<CardFooter className="p-0 mt-2 pt-1 border-t-[1.5px] border-neutral-200">
					<p className="body-3 text-neutral-600 line-clamp-2">{lineup.notes}</p>
				</CardFooter>
			)}
		</Card>
	);
}
