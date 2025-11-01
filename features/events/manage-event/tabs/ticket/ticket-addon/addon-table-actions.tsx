"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EventTicketAddon } from "@/types/event-ticket.types";

type AddonTableActionsProps = {
	addon: EventTicketAddon;
	onViewDetails?: (addonId: string) => void;
	onEdit?: (addon: EventTicketAddon) => void;
	onToggleStatus?: (addonId: string, isActive: boolean) => Promise<void>;
	onDelete?: (addonId: string) => void;
};

export default React.memo(function AddonTableActions({
	addon,
	onViewDetails,
	onEdit,
	onToggleStatus,
	onDelete,
}: AddonTableActionsProps) {
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
				<DropdownMenuItem onClick={() => onToggleStatus(addon.id, !addon.is_active)}>
					{addon.is_active ? "Deactivate" : "Activate"}
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
