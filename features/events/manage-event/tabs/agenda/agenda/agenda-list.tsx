"use client";

import { useState, useRef } from "react";
import { Plus, List } from "lucide-react";
import { EventAgenda } from "@/types/event-agenda.types";
import AgendaItemCard from "./agenda-item-card";
import AgendaItemForm, { AgendaFormRef } from "./agenda-item-form";
import AppButton from "@/components/app/app-button";
import SectionWrapper from "../../../section-wrapper";
// Import timeOptions for sorting
import { timeOptions } from "../time-select";
import EmptyData from "@/components/app/empty-data";

type AgendaListProps = {
	agendas: EventAgenda[];
	onAddAgenda: (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		hosts: Array<{ name: string; image?: File }>;
	}) => Promise<void>;
	onUpdateAgenda: (
		agendaId: string,
		data: {
			title: string;
			description?: string;
			start_time: string;
			end_time: string;
			hosts: Array<{ name: string; image?: File }>;
		}
	) => Promise<void>;
	onDeleteAgenda: (agendaId: string) => Promise<void>;
	isLoading?: boolean;
};

export default function AgendaList({
	agendas,
	onAddAgenda,
	onUpdateAgenda,
	onDeleteAgenda,
	isLoading = false,
}: AgendaListProps) {
	const [editingAgenda, setEditingAgenda] = useState<EventAgenda | null>(null);
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [isFormLoading, setIsFormLoading] = useState(false);
	const [mode, setMode] = useState<"view" | "edit">("view");
	const formRef = useRef<AgendaFormRef>(null);

	const handleEdit = (agenda: EventAgenda) => {
		if (mode === "view") {
			setMode("edit");
		}
		setEditingAgenda(agenda);
		setIsAddingNew(false);
	};

	const handleAddNew = async () => {
		// If there's an open form (adding or editing), validate and save it first
		if (isAddingNew || editingAgenda) {
			const isValid = formRef.current?.validate();

			if (!isValid) {	
				// Validation failed, don't proceed
				return;
			}

			// Trigger form submission
			try {
				await formRef.current?.submit();
				// Form saved successfully, now open new form
				setIsAddingNew(true);
				setEditingAgenda(null);
			} catch (error) {
				// Save failed, don't open new form
				console.error("Save error:", error);
			}
		} else {
			// No form open, just open new form
			setIsAddingNew(true);
			setEditingAgenda(null);
		}

		if (mode === "view") {
			setMode("edit");
		}
	};

	// const handleSave = async () => {
	// 	setIsFormLoading(true);
	// 	try {
	// 		await formRef.current?.submit();
	// 	} catch (error) {
	// 		console.error("Save error:", error);
	// 	} finally {
	// 		setIsFormLoading(false);
	// 	}
	// };

	const handleModeChange = (newMode: "view" | "edit") => {
		setMode(newMode);
		if (newMode === "view") {
			// Clear any open forms when switching to view mode
			setIsAddingNew(false);
			setEditingAgenda(null);
		}
	};

	const handleReset = () => {
		setEditingAgenda(null);
		setIsAddingNew(false);
	};

	const handleSave = async (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		hosts: Array<{ name: string; image?: File }>;
	}) => {
		setIsFormLoading(true);
		try {
			if (editingAgenda) {
				await onUpdateAgenda(editingAgenda.id, data);
			} else {
				await onAddAgenda(data);
			}
			handleReset();
		} catch (error) {
			console.error("Save error:", error);
		} finally {
			setIsFormLoading(false);
		}
	};

	const handleDelete = async (agendaId: string) => {
		setIsFormLoading(true);
		try {
			await onDeleteAgenda(agendaId);
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setIsFormLoading(false);
		}
	};

	// Sort agendas by start time
	// const sortedAgendas = [];
	const sortedAgendas = [...agendas].sort((a, b) => {
		const timeA = timeOptions.find((option) => option.value === a.start_time)?.label;
		const timeB = timeOptions.find((option) => option.value === b.start_time)?.label;
		return timeA?.localeCompare(timeB || "") || 0;
	});

	const renderViewMode = () => (
		<div className="space-y-4">
			{/* Agenda Items */}
			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-32 bg-neutral-100 rounded-lg animate-pulse" />
					))}
				</div>
			) : sortedAgendas.length === 0 ? (
				<EmptyData
					showIcon={false}
					text="Add agenda items to organize your event timeline"
					action={
						<AppButton
							onClick={handleAddNew}
							variant="primary"
							leftIcon={<Plus className="w-4 h-4" />}
						>
							Add Agenda
						</AppButton>
					}
				/>
			) : (
				<div className="space-y-4 max-h-96 overflow-y-auto pr-1">
					{sortedAgendas.map((agenda) => (
						<AgendaItemCard
							key={agenda.id}
							agenda={agenda}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);

	const renderEditMode = () => (
		<div className="space-y-4">
			{/* Agenda Items List with Inline Editing */}
			{sortedAgendas.length > 0 && (
				<div className="space-y-4">
					<h4 className="text-sm font-semibold text-neutral-700">
						Current Agenda Items ({sortedAgendas.length})
					</h4>
					<div className="max-h-96 overflow-y-auto pr-1 space-y-4">
						{sortedAgendas.map((agenda) => (
							<div key={agenda.id}>
								{editingAgenda?.id === agenda.id ? (
									<AgendaItemForm
										ref={formRef}
										agenda={editingAgenda}
										onSave={handleSave}
										onCancel={handleReset}
										isLoading={isFormLoading}
										isInline={true}
									/>
								) : (
									<AgendaItemCard agenda={agenda} onEdit={handleEdit} onDelete={handleDelete} />
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Add New Form at Bottom */}
			{isAddingNew && (
				<div className="border-t border-neutral-200 pt-4">
					{/* <h4 className="text-sm font-semibold text-neutral-700 mb-4">Add New Agenda Item</h4> */}
					<AgendaItemForm
						ref={formRef}
						onSave={handleSave}
						onCancel={handleReset}
						isLoading={isFormLoading}
						isInline={true}
					/>
				</div>
			)}
			<div className="flex justify-center">
				<AppButton
					onClick={handleAddNew}
					disabled={isLoading || isFormLoading}
					variant="muted"
					className="text-primary-500 w-full py-3 justify-center border"
					leftIcon={<Plus className="w-4 h-4" />}
				>
					{isAddingNew || editingAgenda ? "Save & Add New" : "Add Agenda"}
				</AppButton>
			</div>
		</div>
	);

	return (
		<SectionWrapper
			title="Event Agenda"
			icon={<List className="w-5 h-5 text-primary-500" />}
			description="Organize your event timeline with scheduled activities, speakers, and hosts."
			showSaveButton={false}
			isLoading={isFormLoading}
			mode={mode}
			onModeChange={handleModeChange}
		>
			{(mode) => (mode === "view" ? renderViewMode() : renderEditMode())}
		</SectionWrapper>
	);
}
