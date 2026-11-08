"use client";

import * as React from "react";
import { Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventTicketAddon } from "@/types/event-ticket.types";

type AddonTableActionsProps = {
	addon: EventTicketAddon;
	isActive: boolean;
	onViewDetails?: (addonId: string) => void;
	onEdit?: (addon: EventTicketAddon) => void;
	onToggleStatus?: (addonId: string, isActive: boolean) => Promise<void>;
	isTogglingStatus?: boolean;
	onDelete?: (addonId: string) => void;
};

export default React.memo(function AddonTableActions({
	addon,
	isActive,
	onViewDetails,
	onEdit,
	onToggleStatus,
	isTogglingStatus,
	onDelete,
}: AddonTableActionsProps) {
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
				<DropdownMenuItem onClick={() => onViewDetails(addon.id)}>View</DropdownMenuItem>
			)}
			{onEdit && <DropdownMenuItem onClick={() => onEdit(addon)}>Edit</DropdownMenuItem>}
			{onToggleStatus && (
				<DropdownMenuItem onClick={() => onToggleStatus(addon.id, !isActive)}>
					{isActive ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
			)}
			{onDelete && (
				<DropdownMenuItem
					onClick={() => onDelete(addon.id)}
					className="text-red-600 focus:text-red-600"
				>
					Delete
				</DropdownMenuItem>
			)}
		</AppDropdown>
	);
});
