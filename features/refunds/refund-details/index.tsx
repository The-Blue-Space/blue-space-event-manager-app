"use client";

import { useQuery } from "@tanstack/react-query";
import AppDrawer from "@/components/app/app-drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";
import { getRefundDetails } from "@/services/refunds";
import RefundInformation from "./refund-information";
import AmountDetails from "./amount-details";
import CustomerDetails from "./customer-details";
import RefundTimeline from "./refund-timeline";
import RefundActions from "./refund-actions";

type RefundDetailsDrawerProps = {
	refundId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onApprove?: (refundId: string) => void;
	onReject?: (refundId: string) => void;
};

export default function RefundDetailsDrawer({
	refundId,
	open,
	onOpenChange,
	onApprove,
	onReject,
}: RefundDetailsDrawerProps) {
	const {
		data: refund,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["refund-details", refundId],
		queryFn: () => getRefundDetails({ refundId: refundId! }),
		enabled: !!refundId && open,
	});

	return (
		<AppDrawer
			title="Refund Details"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
		>
			{isLoading ? (
				<div className="space-y-6 p-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : error ? (
				<div className="flex flex-col items-center justify-center py-12 text-center px-6">
					<XCircle className="h-12 w-12 text-error-500 mb-4" />
					<p className="text-sm text-neutral-600">Failed to load refund details</p>
				</div>
			) : refund ? (
				<div className="space-y-6 p-6">
					{/* Refund Information */}
					<RefundInformation refund={refund} />
					<Separator />

					{/* Amount Details */}
					<AmountDetails refund={refund} />
					<Separator />

					{/* Customer Information */}
					<CustomerDetails refund={refund} />
					<Separator />

					{/* Timeline */}
					<RefundTimeline refund={refund} />

					{/* Actions for pending refunds */}
					{refund.status === "pending" && (
						<>
							<Separator />
							<RefundActions
								refundId={refund.id}
								onApprove={onApprove}
								onReject={onReject}
							/>
						</>
					)}
				</div>
			) : null}
		</AppDrawer>
	);
}
