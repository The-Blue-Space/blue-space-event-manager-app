"use client";

import AppButton from "@/components/app/app-button";
import { Check, X } from "lucide-react";

type Props = {
	refundId: string;
	onApprove?: (refundId: string) => void;
	onReject?: (refundId: string) => void;
};

export default function RefundActions({ refundId, onApprove, onReject }: Props) {
	return (
		<div className="space-y-4">
			<h3 className="body-1 font-semibold text-neutral-900">Actions</h3>

			<div className="flex gap-3">
				<AppButton
					variant="outline"
					className="flex-1 border-error-300 text-error-600 hover:bg-error-50"
					onClick={() => onReject?.(refundId)}
				>
					<X className="h-4 w-4 mr-2" />
					Reject
				</AppButton>
				<AppButton
					variant="black"
					className="flex-1 bg-success-600 hover:bg-success-700"
					onClick={() => onApprove?.(refundId)}
				>
					<Check className="h-4 w-4 mr-2" />
					Approve
				</AppButton>
			</div>
		</div>
	);
}
