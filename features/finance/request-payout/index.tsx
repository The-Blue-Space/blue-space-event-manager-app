"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import getPendingPayouts from "@/services/finance/get-pending-payouts";
import requestPayout from "@/services/finance/request-payout";
import getFinanceDashboard from "@/services/finance/get-finance-dashboard";
import { Payout } from "@/types/finance.types";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyData from "@/components/app/empty-data";
import AppButton from "@/components/app/app-button";
import { Badge } from "@/components/ui/badge";
import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import invalidateQuery from "@/lib/invalidate-query";

export default function RequestPayoutTab() {
	const { activeCurrency, currencies } = useAppSelector("init");
	const [processingId, setProcessingId] = React.useState<string | null>(null);

	const { data: dashboardData } = useQuery({
		queryKey: ["finance-dashboard"],
		queryFn: () => getFinanceDashboard(),
	});

	const { data: payoutsData, isLoading } = useQuery({
		queryKey: ["pending-payouts"],
		queryFn: () => getPendingPayouts(),
	});

	const handleRequestPayout = async (payout: Payout) => {
		const defaultBank = dashboardData?.bank_details.find((b) => b.is_default);
		if (!defaultBank) {
			toast.error("Please set a default bank account first");
			return;
		}

		setProcessingId(payout.id);
		try {
			await requestPayout({
				event_id: payout.event_id,
				bank_id: defaultBank.id,
			});
			toast.success("Payout request submitted successfully");
			invalidateQuery(["pending-payouts", "finance-dashboard"]);
		} catch (error: any) {
			toast.error(error?.message || "Failed to request payout");
		} finally {
			setProcessingId(null);
		}
	};

	const getStatusBadge = (status: Payout["status"]) => {
		switch (status) {
			case "pending":
				return (
					<Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-200">
						Pending
					</Badge>
				);
			case "requested":
				return (
					<Badge variant="outline" className="bg-warning-100 text-warning-500 border-warning-200">
						Requested
					</Badge>
				);
			case "paid":
				return (
					<Badge variant="outline" className="bg-success-100 text-success-500 border-success-200">
						Paid
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="outline" className="bg-error-100 text-error-500 border-error-200">
						Rejected
					</Badge>
				);
			default:
				return null;
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
						<Skeleton className="h-4 w-48 mb-2" />
						<Skeleton className="h-4 w-32" />
					</div>
				))}
			</div>
		);
	}

	const payouts = payoutsData?.docs || [];

	if (payouts.length === 0) {
		return (
			<EmptyData
				title="No Payouts Available"
				text="You don't have any pending payouts at the moment"
				className="!justify-start py-10 border border-dashed border-neutral-300 rounded-lg"
			/>
		);
	}

	return (
		<div className="overflow-x-auto border rounded-lg">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Event Name</TableHead>
						<TableHead>Total Revenue</TableHead>
						<TableHead>Collection Fee</TableHead>
						<TableHead>Withdrawable Amount</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{payouts.map((payout) => {
						const currency =
							currencies.find((c) => c.id === payout.currency_id)?.symbol || activeCurrency.symbol;
						const isProcessing = processingId === payout.id;
						const isRequested = payout.status === "requested";
						return (
							<TableRow key={payout.id}>
								<TableCell className="font-medium">{payout.event_name}</TableCell>
								<TableCell>
									{currency} {amountSeparator(payout.total_revenue)}
								</TableCell>
								<TableCell>
									{currency} {amountSeparator(payout.collection_fee)}
								</TableCell>
								<TableCell>
									{currency} {amountSeparator(payout.payout_amount)}
								</TableCell>
								<TableCell>{getStatusBadge(payout.status)}</TableCell>
								<TableCell>
									{payout.status === "pending" ? (
										<AppButton
											variant="outline"
											onClick={() => handleRequestPayout(payout)}
											isLoading={isProcessing}
											disabled={isProcessing}
										>
											Request
										</AppButton>
									) : (
										<AppButton variant="outline" disabled>
											{isRequested ? "Requested" : "Completed"}
										</AppButton>
									)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
