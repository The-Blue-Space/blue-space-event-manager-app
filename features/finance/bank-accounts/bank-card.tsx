"use client";

import { BankDetails } from "@/types/finance.types";
import { Badge } from "@/components/ui/badge";
import { Landmark, MoreVertical, Star, Trash2 } from "lucide-react";
import AppDropdown from "@/components/app/app-dropdown";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type BankCardProps = {
	bank: BankDetails;
	onSetDefault: (bankId: string) => void;
	onDelete: (bankId: string) => void;
};

export default function BankCard({ bank, onSetDefault, onDelete }: BankCardProps) {
	return (
		<div className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors flex items-center gap-4 w-full min-w-[320px] lg:min-w-0 snap-start">
			{/* Bank Icon */}
			<div className="flex-shrink-0">
				<div className="w-12 h-12 rounded-full bg-badge flex items-center justify-center">
					<Landmark className="w-6 h-6 text-primary-600" />
				</div>
			</div>

			{/* Account Details */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<p className="body-1 font-semibold text-neutral-900 truncate capitalize">
						{bank.account_name.toLowerCase()}
					</p>
					{bank.is_default && (
						<Badge
							variant="outline"
							className=" text-primary-500 border-primary-200 text-xs flex-shrink-0"
						>
							Default
						</Badge>
					)}
				</div>
				<p className="body-3 text-neutral-500 font-mono">{bank.account_number}</p>
				<p className="body-3 text-neutral-600 font-medium">{bank.bank_name}</p>
			</div>

			{/* Actions Dropdown */}
			<div className="flex-shrink-0">
				<AppDropdown
					trigger={
						<button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
							<MoreVertical className="w-5 h-5 text-neutral-600" />
						</button>
					}
					align="end"
					position="bottom"
				>
					<DropdownMenuItem
						onClick={() => onSetDefault(bank.id)}
						disabled={bank.is_default}
						className="flex items-center gap-2"
					>
						<Star className="w-4 h-4" />
						Set as Default
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => onDelete(bank.id)}
						className="flex items-center gap-2 text-error-500"
					>
						<Trash2 className="w-4 h-4" />
						Delete
					</DropdownMenuItem>
				</AppDropdown>
			</div>
		</div>
	);
}
