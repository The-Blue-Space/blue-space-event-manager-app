"use client";

import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AppButton from "@/components/app/app-button";

type RejectDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (note: string) => void;
	isLoading?: boolean;
};

export default function RejectDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading,
}: RejectDialogProps) {
	const [note, setNote] = React.useState("");

	const handleConfirm = () => {
		onConfirm(note);
	};

	const handleClose = () => {
		setNote("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reject Refund Request</DialogTitle>
					<DialogDescription>
						Please provide a reason for rejecting this refund request. This will be sent to the customer.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<Textarea
						placeholder="Enter rejection reason (optional)..."
						value={note}
						onChange={(e) => setNote(e.target.value)}
						className="min-h-[100px]"
						disabled={isLoading}
					/>
				</div>

				<DialogFooter className="gap-2">
					<AppButton
						variant="outline"
						onClick={handleClose}
						disabled={isLoading}
					>
						Cancel
					</AppButton>
					<AppButton
						variant="black"
						className="bg-error-600 hover:bg-error-700"
						onClick={handleConfirm}
						isLoading={isLoading}
					>
						Reject Refund
					</AppButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
