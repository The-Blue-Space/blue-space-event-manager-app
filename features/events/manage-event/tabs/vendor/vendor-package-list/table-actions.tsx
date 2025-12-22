"use client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { VendorPackage } from "@/types/vendor.types";
import { useState } from "react";
import AppDialog from "@/components/app/app-dialog";

type Props = {
	pkg: VendorPackage;
	onEdit: () => void;
	onDelete: () => void;
};

export default function TableActions({ pkg, onEdit, onDelete }: Props) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete();
			setShowDeleteDialog(false);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={onEdit}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setShowDeleteDialog(true)}
						className="text-error-600 focus:text-error-600"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AppDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title="Delete Package"
				description={`Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`}
				confirmText="Delete"
				confirmVariant="destructive"
				onConfirm={handleDelete}
				isLoading={isDeleting}
			/>
		</>
	);
}
