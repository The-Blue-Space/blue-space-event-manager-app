"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import AppButton from "@/components/app/app-button";

type ApproveDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isLoading?: boolean;
};

export default function ApproveDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading,
}: ApproveDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Approve Refund Request</DialogTitle>
					<DialogDescription>
						Are you sure you want to approve this refund request? The refund will be processed and the customer will be notified.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="gap-2">
					<AppButton
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						Cancel
					</AppButton>
					<AppButton
						variant="black"
						className="bg-success-600 hover:bg-success-700"
						onClick={onConfirm}
						isLoading={isLoading}
					>
						Approve Refund
					</AppButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
