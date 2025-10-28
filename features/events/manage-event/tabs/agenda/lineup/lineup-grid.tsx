"use client";

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
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { EventLineup } from "@/types/event-agenda.types";
import LineupCard from "./lineup-card";
import { cn } from "@/lib/utils";

type SortableLineupCardProps = {
	lineup: EventLineup;
	onEdit: (lineup: EventLineup) => void;
	onDelete: (lineupId: string) => void;
};

function SortableLineupCard({ lineup, onEdit, onDelete }: SortableLineupCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: lineup.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			<div className="flex items-center gap-2">
				<div {...listeners} className="cursor-move p-1 hover:bg-neutral-100 rounded">
					<GripVertical className="w-4 h-4 text-neutral-400" />
				</div>
				<div className="flex-1">
					<LineupCard lineup={lineup} onEdit={onEdit} onDelete={onDelete} isDraggable={true} />
				</div>
			</div>
		</div>
	);
}

type LineupGridProps = {
	lineups: EventLineup[];
	onEdit: (lineup: EventLineup) => void;
	onDelete: (lineupId: string) => void;
	onReorder: (lineupId: string, newOrder: number) => Promise<void>;
	mode: "view" | "edit";
};

export default function LineupGrid({
	lineups,
	onEdit,
	onDelete,
	onReorder,
	mode,
}: LineupGridProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = lineups.findIndex((lineup) => lineup.id === active.id);
			const newIndex = lineups.findIndex((lineup) => lineup.id === over?.id);

			const reorderedLineups = arrayMove(lineups, oldIndex, newIndex);

			// Update the order for the moved item
			const movedLineup = reorderedLineups[newIndex];
			await onReorder(movedLineup.id, newIndex + 1);
		}
	};

	if (lineups.length === 0) {
		return null;
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={lineups.map((l) => l.id)} strategy={verticalListSortingStrategy}>
				<div
					className={cn(" gap-4", {
						"grid grid-cols-1 md:grid-cols-2": mode === "view",
						"flex flex-col": mode === "edit",
					})}
				>
					{lineups.map((lineup) => (
						<SortableLineupCard
							key={lineup.id}
							lineup={lineup}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
