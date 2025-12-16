"use client";

import { useState, useEffect } from "react";
import {
	DndContext,
	closestCenter,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import GrowthCharts from "./charts/growth-charts";
import UpcomingEvents from "./upcoming-events";
import ActiveEvents from "./active-events";
import RevenueChart from "./charts/revenue-chart";
import useStorage from "@/hooks/use-storage";
import DraggableCard from "./draggable-card";

type ComponentId = "growth-charts" | "revenue-chart" | "active-events" | "upcoming-events";

type LayoutConfig = {
	column1: ComponentId[]; // Stack of charts on left
	column2: ComponentId; // Middle column
	column3: ComponentId; // Right column
};

const DEFAULT_LAYOUT: LayoutConfig = {
	column1: ["growth-charts", "revenue-chart"],
	column2: "active-events",
	column3: "upcoming-events",
};

export function Activities() {
	const storage = useStorage();
	const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);
	const [activeId, setActiveId] = useState<ComponentId | null>(null);

	// Load layout from localStorage on mount
	useEffect(() => {
		const savedLayout = storage.get<LayoutConfig>(
			"dashboard-layout",
			DEFAULT_LAYOUT,
			"localStorage"
		);
		if (savedLayout) {
			setLayout(savedLayout);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Save layout to localStorage whenever it changes
	useEffect(() => {
		if (layout !== DEFAULT_LAYOUT) {
			storage.set("dashboard-layout", layout, "localStorage");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layout]);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as ComponentId);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over || active.id === over.id) return;

		const activeId = active.id as ComponentId;
		const overId = over.id as ComponentId;

		setLayout((prev) => {
			const newLayout = { ...prev };

			// Find where the active component is
			const activeInColumn1 = prev.column1.includes(activeId);
			const activeIsColumn2 = prev.column2 === activeId;
			const activeIsColumn3 = prev.column3 === activeId;

			// Find where we're dropping
			const overInColumn1 = prev.column1.includes(overId);
			const overIsColumn2 = prev.column2 === overId;
			const overIsColumn3 = prev.column3 === overId;

			// Handle swaps within column1 (vertical stack)
			if (activeInColumn1 && overInColumn1) {
				const activeIndex = prev.column1.indexOf(activeId);
				const overIndex = prev.column1.indexOf(overId);
				const newColumn1 = [...prev.column1];
				[newColumn1[activeIndex], newColumn1[overIndex]] = [
					newColumn1[overIndex],
					newColumn1[activeIndex],
				];
				newLayout.column1 = newColumn1;
				return newLayout;
			}

			// Handle swaps between columns (horizontal)
			if (activeInColumn1 && overIsColumn2) {
				// Remove from column1, place in column2, move column2 to column1
				newLayout.column1 = prev.column1.filter((id) => id !== activeId);
				newLayout.column1.push(prev.column2);
				newLayout.column2 = activeId;
			} else if (activeInColumn1 && overIsColumn3) {
				newLayout.column1 = prev.column1.filter((id) => id !== activeId);
				newLayout.column1.push(prev.column3);
				newLayout.column3 = activeId;
			} else if (activeIsColumn2 && overInColumn1) {
				const overIndex = prev.column1.indexOf(overId);
				const removed = prev.column1[overIndex];
				newLayout.column1 = [...prev.column1];
				newLayout.column1[overIndex] = activeId;
				newLayout.column2 = removed;
			} else if (activeIsColumn2 && overIsColumn3) {
				newLayout.column2 = prev.column3;
				newLayout.column3 = activeId;
			} else if (activeIsColumn3 && overInColumn1) {
				const overIndex = prev.column1.indexOf(overId);
				const removed = prev.column1[overIndex];
				newLayout.column1 = [...prev.column1];
				newLayout.column1[overIndex] = activeId;
				newLayout.column3 = removed;
			} else if (activeIsColumn3 && overIsColumn2) {
				newLayout.column3 = prev.column2;
				newLayout.column2 = activeId;
			}

			return newLayout;
		});
	};

	const renderComponent = (id: ComponentId, isDragging?: boolean) => {
		const components = {
			"growth-charts": <GrowthCharts />,
			"revenue-chart": <RevenueChart />,
			"active-events": <ActiveEvents />,
			"upcoming-events": <UpcomingEvents />,
		};

		return (
			<DraggableCard id={id} key={id} isDragging={isDragging}>
				{components[id]}
			</DraggableCard>
		);
	};

	const allComponentIds = [...layout.column1, layout.column2, layout.column3];

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={allComponentIds} strategy={horizontalListSortingStrategy}>
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start w-full">
					<div className="col-span-full">
						<h2 className="body-1 font-bold">Activities</h2>
					</div>

					{/* Column 1 - Vertical stack */}
					<div className="xl:col-span-1 space-y-5">
						<SortableContext items={layout.column1} strategy={verticalListSortingStrategy}>
							{layout.column1.map((id) => renderComponent(id))}
						</SortableContext>
					</div>

					{/* Columns 2 & 3 - Side by side */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-5 xl:col-span-2 items-start w-full">
						{renderComponent(layout.column2)}
						{renderComponent(layout.column3)}
					</div>
				</div>
			</SortableContext>

			<DragOverlay>
				{activeId ? (
					<div className="opacity-50 rotate-3 scale-105">{renderComponent(activeId, true)}</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
