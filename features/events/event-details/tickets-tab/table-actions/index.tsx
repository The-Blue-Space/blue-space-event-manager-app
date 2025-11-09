"use client";

import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Eye, Ban, MoreVertical } from "lucide-react";

type TableActionsProps = {
	onView: () => void;
	onRevoke: () => void;
};

export default function TableActions({ onView, onRevoke }: TableActionsProps) {
	return (
		<AppDropdown
			trigger={
				<button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
					<MoreVertical className="w-4 h-4 text-neutral-600" />
				</button>
			}
			align="end"
			
		>
			<DropdownMenuItem onClick={onView} className="cursor-pointer">
				<Eye className="w-4 h-4 mr-2" />
				View Details
			</DropdownMenuItem>
			<DropdownMenuItem onClick={onRevoke} className="text-error-500 cursor-pointer">
				<Ban className="w-4 h-4 mr-2" />
				Revoke Ticket
			</DropdownMenuItem>
		</AppDropdown>
	);
}
