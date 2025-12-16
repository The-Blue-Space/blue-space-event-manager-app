"use client";

import { useState, useRef } from "react";
import { Plus, Mic2 } from "lucide-react";
import { EventLineup } from "@/types/event-agenda.types";
import LineupGrid from "./lineup-grid";
import LineupForm, { LineupFormRef } from "./lineup-form";
import AppButton from "@/components/app/app-button";
import SectionWrapper from "../../../section-wrapper";
import EmptyData from "@/components/app/empty-data";
import Render from "@/components/app/render";

type LineupListProps = {
	lineups: EventLineup[];
	onAddLineup: (data: {
		artist_name: string;
		artist_image?: File;
		start_time?: string;
		end_time?: string;
		is_headliner: boolean;
		notes?: string;
		socials: string[];
	}) => Promise<void>;
	onUpdateLineup: (
		lineupId: string,
		data: {
			artist_name: string;
			artist_image?: File;
			start_time?: string;
			end_time?: string;
			is_headliner: boolean;
			notes?: string;
			socials: string[];
		}
	) => Promise<void>;
	onDeleteLineup: (lineupId: string) => Promise<void>;
	onReorderLineup: (lineupId: string, newOrder: number) => Promise<void>;
	isLoading?: boolean;
};

export default function LineupList({
	lineups,
	onAddLineup,
	onUpdateLineup,
	onDeleteLineup,
	onReorderLineup,
	isLoading = false,
}: LineupListProps) {
	const [editingLineup, setEditingLineup] = useState<EventLineup | null>(null);
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [mode, setMode] = useState<"view" | "edit">("view");
	const formRef = useRef<LineupFormRef>(null);

	const handleEdit = (lineup: EventLineup) => {
		if (mode === "view") {
			setMode("edit");
		}
		setEditingLineup(lineup);
		setIsAddingNew(false);
	};

	const handleAddNew = async () => {
		// If there's an open form (adding or editing), validate and save it first
		if (isAddingNew || editingLineup) {
			const isValid = formRef.current?.validate();

			if (!isValid) {
				// Validation failed, don't proceed
				return;
			}

			// Trigger form submission
			try {
				await formRef.current?.submit();
				// Form saved successfully, now open new form
				// setIsAddingNew(true);
				setEditingLineup(null);
			} catch (error) {
				// Save failed, don't open new form
				console.error("Save error:", error);
			}
		} else {
			// No form open, just open new form
			setIsAddingNew(true);
			setEditingLineup(null);
		}

		if (mode === "view") {
			setMode("edit");
		}
	};

	const handleModeChange = (newMode: "view" | "edit") => {
		setMode(newMode);
		if (newMode === "view") {
			// Clear any open forms when switching to view mode
			setIsAddingNew(false);
			setEditingLineup(null);
		}
	};

	const handleCancel = () => {
		setEditingLineup(null);
        setIsAddingNew(false);
        
	};

	const handleSave = async (data: {
		artist_name: string;
		artist_image?: File;
		start_time?: string;
		end_time?: string;
		is_headliner: boolean;
		notes?: string;
		socials: string[];
	}) => {
		setIsFormLoading(true);
		try {
			if (editingLineup) {
				await onUpdateLineup(editingLineup.id, data);
			} else {
				await onAddLineup(data);
			}
			handleCancel();
		} catch (error) {
			console.error("Save error:", error);
		} finally {
			setIsFormLoading(false);
		}
	};

	const handleDelete = async (lineupId: string) => {
		setIsFormLoading(true);
		try {
			await onDeleteLineup(lineupId);
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setIsFormLoading(false);
		}
	};

	const handleReorder = async (lineupId: string, newOrder: number) => {
		try {
			await onReorderLineup(lineupId, newOrder);
		} catch (error) {
			console.error("Reorder error:", error);
		}
	};

	// Sort lineups by order
	const sortedLineups = [...lineups].sort((a, b) => a.order - b.order);

	const renderViewMode = () => (
		<div className="space-y-4">
			{/* Lineup Items */}

			<Render isLoading={isLoading} loadingComponent={<LoadingComponent />}>
				{sortedLineups.length === 0 ? (
					<EmptyData
						showIcon={false}
						text="Add artists and performers to your event lineup"
						action={
							<AppButton
								onClick={handleAddNew}
								variant="primary"
								leftIcon={<Plus className="w-4 h-4" />}
							>
								Add Artist
							</AppButton>
						}
					/>
				) : (
					<LineupGrid
						mode="view"
						lineups={sortedLineups}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onReorder={handleReorder}
					/>
				)}
			</Render>
		</div>
	);

	const renderEditMode = () => (
		<div className="space-y-4">
			{/* Add Button */}

			{/* Lineup Items List with Inline Editing */}
			{sortedLineups.length > 0 && (
				<div className="space-y-4">
					<h4 className="text-sm font-semibold text-neutral-700">
						Current Lineup ({sortedLineups.length})
					</h4>
					<div className="space-y-4 w-full">
						{sortedLineups.map((lineup) => (
							<div key={lineup.id} className="w-full">
								{editingLineup?.id === lineup.id ? (
									<LineupForm
										ref={formRef}
										lineup={editingLineup}
										onSave={handleSave}
										onCancel={handleCancel}
										isLoading={isFormLoading}
										isInline={true}
										isEdit={true}
									/>
								) : (
									<LineupGrid
										mode="edit"
										lineups={[lineup]}
										onEdit={handleEdit}
										onDelete={handleDelete}
										onReorder={handleReorder}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Add New Form at Bottom */}
			{isAddingNew && (
				<div className="border-t border-neutral-200 pt-4">
					<h4 className="text-sm font-semibold text-neutral-700 mb-4">Add New Lineup</h4>
					<LineupForm
						ref={formRef}
						onSave={handleSave}
						onCancel={handleCancel}
						isLoading={isFormLoading}
						isInline={true}
						isEdit={false}
					/>
				</div>
			)}
			<div className="flex justify-end">
				<AppButton
					onClick={handleAddNew}
					disabled={isLoading || isFormLoading}
					isLoading={isFormLoading}
					variant="primary"
					leftIcon={<Plus className="w-4 h-4" />}
				>
					Add Lineup
				</AppButton>
			</div>
		</div>
	);

	return (
		<SectionWrapper
			title="Event Lineup"
			icon={<Mic2 className="w-5 h-5 text-primary-500" />}
			description="Manage artists, speakers, and performers for your event"
			showSaveButton={false}
			showCancelButton={false}
			isLoading={isFormLoading}
			mode={mode}
			onModeChange={handleModeChange}
		>
			{(sectionMode) => (sectionMode === "view" ? renderViewMode() : renderEditMode())}
		</SectionWrapper>
	);
}

function LoadingComponent() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="h-24 bg-neutral-100 rounded-lg animate-pulse" />
			))}
		</div>
	);
}
