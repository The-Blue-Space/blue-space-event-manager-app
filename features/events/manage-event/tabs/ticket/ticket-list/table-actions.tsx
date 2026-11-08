"use client";

import * as React from "react";
import { Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventTicket } from "@/types/event-ticket.types";

type TableActionsProps = {
	ticket: EventTicket;
	isActive: boolean;
	onViewDetails?: (ticketId: string) => void;
	onEdit?: (ticket: EventTicket) => void;
	onToggleStatus?: (ticketId: string, isActive: boolean) => Promise<void>;
	isTogglingStatus?: boolean;
	onAddPromo?: (ticketId: string) => void;
	onDelete?: (ticketId: string) => void;
};

export default React.memo(function TableActions({
	ticket,
	isActive,
	onViewDetails,
	onEdit,
	onToggleStatus,
	isTogglingStatus,
	onAddPromo,
	onDelete,
}: TableActionsProps) {
	if (isTogglingStatus) {
		return (
			<div className="h-8 w-8 flex items-center justify-center">
				<Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
			</div>
		);
	}

	return (
		<AppDropdown
			trigger={
				<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
					<MoreVertical className="h-4 w-4" />
				</Button>
			}
			align="end"
		>
			{onViewDetails && (
				<DropdownMenuItem onClick={() => onViewDetails(ticket.id)}>View</DropdownMenuItem>
			)}
			{onEdit && <DropdownMenuItem onClick={() => onEdit(ticket)}>Edit</DropdownMenuItem>}
			{onToggleStatus && (
				<DropdownMenuItem onClick={() => onToggleStatus(ticket.id, !isActive)}>
					{isActive ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
			)}
			{ticket.type === "paid" && onAddPromo && (
				<DropdownMenuItem onClick={() => onAddPromo(ticket.id)}>
					{ticket.ticket_promo_id ? "Edit Promo" : "Add Promo"}
				</DropdownMenuItem>
			)}
			{onDelete && (
				<DropdownMenuItem
					onClick={() => onDelete(ticket.id)}
					className="text-red-600 focus:text-red-600"
				>
					Delete
				</DropdownMenuItem>
			)}
		</AppDropdown>
	);
});
