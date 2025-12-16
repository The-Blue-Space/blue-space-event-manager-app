"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

type DraggableCardProps = {
	id: string;
	children: ReactNode;
	isDragging?: boolean;
};

export default function DraggableCard({ id, children }: DraggableCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging: isSortableDragging,
	} = useSortable({
		id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isSortableDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} className="relative group">
			{/* Drag Handle - Always visible */}
			<div
				{...attributes}
				{...listeners}
				className="absolute -left-2 top-4 z-10 cursor-grab active:cursor-grabbing group-hover:bg-white group-hover:border border-neutral-300 rounded-md p-1 shadow-sm hover:shadow-md transition-shadow opacity-60 hover:opacity-100"
				title="Drag to rearrange"
			>
				<GripVertical className="h-4 w-4 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</div>

			{/* Component Content */}
			{children}
		</div>
	);
}
