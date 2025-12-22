"use client";

import { Badge } from "@/components/ui/badge";
import { Refund } from "@/types/refund.types";
import classNames from "classnames";
import { CheckCircle2, Clock, XCircle, Ban, Loader2, RotateCcw } from "lucide-react";

type Props = {
	refund: Refund;
};

export default function RefundInformation({ refund }: Props) {
	const getStatusConfig = (status: Refund["status"]) => {
		switch (status) {
			case "completed":
				return {
					icon: <CheckCircle2 className="h-3 w-3" />,
					className: "bg-success-100 text-success-500 border-success-200",
					label: "Completed",
				};
			case "approved":
				return {
					icon: <CheckCircle2 className="h-3 w-3" />,
					className: "bg-primary-100 text-primary-500 border-primary-200",
					label: "Approved",
				};
			case "pending":
				return {
					icon: <Clock className="h-3 w-3" />,
					className: "bg-warning-100 text-warning-500 border-warning-200",
					label: "Pending",
				};
			case "processing":
				return {
					icon: <Loader2 className="h-3 w-3 animate-spin" />,
					className: "bg-primary-100 text-primary-500 border-primary-200",
					label: "Processing",
				};
			case "failed":
				return {
					icon: <XCircle className="h-3 w-3" />,
					className: "bg-error-100 text-error-500 border-error-200",
					label: "Failed",
				};
			case "rejected":
				return {
					icon: <Ban className="h-3 w-3" />,
					className: "bg-neutral-200 text-neutral-600 border-neutral-300",
					label: "Rejected",
				};
			default:
				return {
					icon: <Clock className="h-3 w-3" />,
					className: "bg-neutral-200 text-neutral-600 border-neutral-300",
					label: status,
				};
		}
	};

	const getReasonLabel = (reason: Refund["reason"]) => {
		const labels: Record<string, string> = {
			event_cancelled: "Event Cancelled",
			user_requested: "User Requested",
			duplicate_payment: "Duplicate Payment",
			vendor_rejected: "Vendor Rejected",
			event_postponed: "Event Postponed",
			other: "Other",
		};
		return labels[reason] || reason;
	};

	const statusConfig = getStatusConfig(refund.status);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="body-1 font-semibold text-neutral-900">Refund Information</h3>
				<Badge
					className={classNames(
						"body-3 flex items-center gap-1 border",
						statusConfig.className
					)}
				>
					{statusConfig.icon}
					{statusConfig.label}
				</Badge>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<p className="body-3 text-neutral-500">Refund ID</p>
					<p className="body-2 font-medium text-neutral-900 break-all">{refund.id}</p>
				</div>
				<div>
					<p className="body-3 text-neutral-500">Type</p>
					<p className="body-2 font-medium text-neutral-900 capitalize">{refund.refund_type}</p>
				</div>
				<div>
					<p className="body-3 text-neutral-500">Reason</p>
					<p className="body-2 font-medium text-neutral-900">{getReasonLabel(refund.reason)}</p>
				</div>
				{refund.event && (
					<div>
						<p className="body-3 text-neutral-500">Event</p>
						<p className="body-2 font-medium text-neutral-900">{refund.event.title}</p>
					</div>
				)}
			</div>

			{refund.notes && (
				<div>
					<p className="body-3 text-neutral-500">Notes</p>
					<p className="body-2 text-neutral-700">{refund.notes}</p>
				</div>
			)}

			{refund.rejection_note && (
				<div className="bg-error-50 border border-error-200 rounded-lg p-3">
					<p className="body-3 text-error-600 font-medium">Rejection Note</p>
					<p className="body-2 text-error-700">{refund.rejection_note}</p>
				</div>
			)}

			{refund.paystack_refund_ref && (
				<div>
					<p className="body-3 text-neutral-500">Paystack Reference</p>
					<p className="body-2 font-medium text-neutral-900 font-mono">{refund.paystack_refund_ref}</p>
				</div>
			)}
		</div>
	);
}
