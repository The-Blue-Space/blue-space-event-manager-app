"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EventTicket } from "@/types/event-ticket.types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type TicketMultiSelectProps = {
	tickets: EventTicket[];
	selectedTicketIds: string[];
	onChange: (ticketIds: string[]) => void;
	label?: string;
	required?: boolean;
	placeholder?: string;
};

export default function TicketMultiSelect({
	tickets,
	selectedTicketIds,
	onChange,
	label,
	required = false,
	placeholder = "Select tickets (optional - leave empty for standalone addon)",
}: TicketMultiSelectProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const filteredTickets = React.useMemo(() => {
		if (!search.trim()) return tickets;
		return tickets.filter(
			(ticket) =>
				ticket.name.toLowerCase().includes(search.toLowerCase()) ||
				ticket.description?.toLowerCase().includes(search.toLowerCase())
		);
	}, [tickets, search]);

	const handleToggle = React.useCallback(
		(ticketId: string) => {
			const currentIds = selectedTicketIds;
			if (currentIds.includes(ticketId)) {
				onChange(currentIds.filter((id) => id !== ticketId));
			} else {
				onChange([...currentIds, ticketId]);
			}
		},
		[selectedTicketIds, onChange]
	);

	const handleRemove = (ticketId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(selectedTicketIds.filter((id) => id !== ticketId));
	};

	const selectedTickets = React.useMemo(
		() => tickets.filter((t) => selectedTicketIds.includes(t.id)),
		[tickets, selectedTicketIds]
	);

	return (
		<div className="space-y-2">
			{label && (
				<Label className="body-2">
					{label} {required && <span className="text-red-500">*</span>}
				</Label>
			)}
			<div className="relative" ref={dropdownRef}>
				{/* Selected Tickets Display */}
				{selectedTickets.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-2 p-3 border border-neutral-200 rounded-lg bg-neutral-50">
						{selectedTickets.map((ticket) => (
							<Badge
								key={ticket.id}
								variant="outline"
								className="flex items-center gap-1 body-3 bg-white"
							>
								{ticket.name}
								<button
									type="button"
									onClick={(e) => handleRemove(ticket.id, e)}
									className="ml-1 hover:bg-neutral-100 rounded-full p-0.5"
								>
									<X className="w-3 h-3" />
								</button>
							</Badge>
						))}
					</div>
				)}

				{/* Dropdown Trigger */}
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-left body-3 bg-white hover:border-neutral-300 transition-colors"
				>
					<span className={selectedTickets.length === 0 ? "text-neutral-500" : "text-neutral-900"}>
						{selectedTickets.length === 0
							? placeholder
							: selectedTickets.length === 1
							? `${selectedTickets.length} ticket selected`
							: `${selectedTickets.length} tickets selected`}
					</span>
				</button>

				{/* Dropdown Content */}
				{isOpen && (
					<div className="absolute z-[999] w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-auto">
						{/* Search */}
						<div className="p-2 border-b border-neutral-200">
							<input
								type="text"
								placeholder="Search tickets..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full px-3 py-2 border border-neutral-200 rounded body-3"
								onClick={(e) => e.stopPropagation()}
							/>
						</div>

						{/* Ticket List */}
						<div className="p-2 space-y-1">
							{tickets.length === 0 ? (
								<p className="text-xs text-neutral-500 p-2">No tickets available</p>
							) : filteredTickets.length === 0 ? (
								<p className="text-xs text-neutral-500 p-2">No tickets found</p>
							) : (
								filteredTickets.map((ticket) => (
									<div
										key={ticket.id}
										className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded cursor-pointer"
										onClick={() => handleToggle(ticket.id)}
									>
										<div onClick={(e) => e.stopPropagation()}>
											<Checkbox
												checked={selectedTicketIds.includes(ticket.id)}
												onCheckedChange={() => handleToggle(ticket.id)}
											/>
										</div>
										<div className="flex-1">
											<p className="body-3 font-medium text-neutral-900">{ticket.name}</p>
											{ticket.description && (
												<p className="text-xs text-neutral-500 line-clamp-1">
													{ticket.description}
												</p>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}
			</div>
			{selectedTickets.length === 0 && (
				<p className="text-xs text-neutral-500">Leave empty to create a standalone addon</p>
			)}
		</div>
	);
}
