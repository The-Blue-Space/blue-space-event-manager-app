import * as React from "react";
import AppCheckbox from "@/components/app/app-checkbox";
import { cn } from "@/lib/utils";

type Attendee = {
	id: string;
	user_id: string;
	name: string;
	email: string;
	status: string;
	avatar?: string;
};

type AttendeeListProps = {
	attendees: Attendee[];
	selectedIds: string[];
	onToggle: (id: string) => void;
	onSelectAll: () => void;
	onDeselectAll: () => void;
};

export default function AttendeeList({
	attendees,
	selectedIds,
	onToggle,
	onSelectAll,
	onDeselectAll,
}: AttendeeListProps) {
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between py-2 border-b border-neutral-200">
				<span className="body-3 text-neutral-600">
					{selectedIds.length} of {attendees.length} selected
				</span>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onSelectAll}
						className="body-3 text-primary-500 hover:underline"
					>
						Select All
					</button>
					<span className="text-neutral-300">|</span>
					<button
						type="button"
						onClick={onDeselectAll}
						className="body-3 text-neutral-500 hover:underline"
					>
						Clear
					</button>
				</div>
			</div>

			<div className="max-h-[200px] overflow-y-auto space-y-1">
				{attendees.map((attendee) => {
					const isSelected = selectedIds.includes(attendee.id);
					return (
						<div
							key={attendee.id}
							onClick={() => onToggle(attendee.id)}
							className={cn(
								"flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
								isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
							)}
						>
							<AppCheckbox
								checked={isSelected}
								onCheckedChange={() => onToggle(attendee.id)}
							/>
							{attendee.avatar ? (
								<img
									src={attendee.avatar}
									alt={attendee.name}
									className="h-8 w-8 rounded-full object-cover"
								/>
							) : (
								<div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium">
									{getInitials(attendee.name)}
								</div>
							)}
							<div className="flex-1 min-w-0">
								<p className="body-3 font-medium text-neutral-800 truncate">
									{attendee.name}
								</p>
								<p className="body-4 text-neutral-500 truncate">{attendee.email}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
