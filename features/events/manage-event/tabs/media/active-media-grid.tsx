"use client";

import { useRef } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EventMedia } from "@/types/event-media.types";
import MediaCard from "./media-card";
import { cn } from "@/lib/utils";

type SortableMediaCardProps = {
	media: EventMedia;
	onAction: (action: string, media?: EventMedia) => void | Promise<void>;
};

function SortableMediaCard({ media, onAction }: SortableMediaCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: media.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={cn(isDragging && "opacity-50")}
		>
			<MediaCard media={media} onAction={onAction} isDraggable />
		</div>
	);
}

type ActiveMediaGridProps = {
	media: EventMedia[];
	onReorder: (reorderedMedia: EventMedia[]) => void | Promise<void>;
	onAction: (action: string, media?: EventMedia) => void | Promise<void>;
	onAddMedia: (file: File) => Promise<void>;
};

export default function ActiveMediaGrid({
	media,
	onReorder,
	onAction,
	onAddMedia,
}: ActiveMediaGridProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = media.findIndex((item) => item.id === active.id);
			const newIndex = media.findIndex((item) => item.id === over.id);

			const reordered = arrayMove(media, oldIndex, newIndex);
			onReorder(reordered);
		}
	};

	// Calculate placeholders (max 6 slots)
	const placeholderCount = Math.max(0, 6 - media.length);
	const placeholders = Array.from({ length: placeholderCount }, (_, i) => i);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			await onAddMedia(file);
		}
		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/gif"
				onChange={handleFileSelect}
				className="hidden"
			/>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={media.map((m) => m.id)} strategy={rectSortingStrategy}>
						{media.map((item) => (
							<SortableMediaCard key={item.id} media={item} onAction={onAction} />
						))}
					</SortableContext>
				</DndContext>

				{/* Placeholder slots */}
				{placeholders.map((index) => (
					<MediaCard key={`placeholder-${index}`} isPlaceholder onUploadClick={triggerFileInput} />
				))}
			</div>

			<p className="text-xs text-neutral-500 mt-3">
				Drag and drop to reorder. Maximum 6 media items.
			</p>
		</div>
	);
}
