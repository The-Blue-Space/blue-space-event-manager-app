"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import getPayoutHistory from "@/services/finance/get-payout-history";
import { Payout, PAYOUT_STATUS } from "@/types/finance.types";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyData from "@/components/app/empty-data";
import AppButton from "@/components/app/app-button";
import { Badge } from "@/components/ui/badge";
import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";
import { getDateAndTime } from "@/lib/format-date";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { SelectBox } from "@/components/app/form-input";
import Pagination from "@/components/app/pagination";

type PayoutHistoryTabProps = {
	onDispute: (payout: Payout) => void;
};

export default function PayoutHistoryTab({ onDispute }: PayoutHistoryTabProps) {
	const { activeCurrency, currencies } = useAppSelector("init");
	const [statusFilter, setStatusFilter] = React.useState<string>("all");
	const [page, setPage] = React.useState(1);
	

	const { data, isLoading } = useQuery({
		queryKey: ["payout-history", statusFilter, page],
		queryFn: () =>
			getPayoutHistory({
				status: statusFilter,
				page,
			}),
	});

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
						Completed
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="outline" className="bg-error-100 text-error-500 border-error-200">
						Failed
					</Badge>
				);
			default:
				return null;
		}
	};

	const canDispute = (status: Payout["status"]) => {
		return status === "paid" || status === "rejected";
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-end">
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="border rounded-lg">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="border-b last:border-b-0 p-4">
							<Skeleton className="h-4 w-48 mb-2" />
							<Skeleton className="h-4 w-32" />
						</div>
					))}
				</div>
			</div>
		);
	}

	const payouts = data?.docs || [];
	const totalPages = data?.totalPages || 1;

	if (payouts.length === 0) {
		return (
			<div className="space-y-4">
				<div className="flex justify-end">
					<SelectBox
						name="status_filter"
						value={statusFilter}
						onchange={(value: string) => {
							setStatusFilter(value);
							setPage(1);
						}}
						containerStyle="!w-fit"
						options={[
							{ value: "all", title: "All Status" },
							...PAYOUT_STATUS.map((status: string) => ({
								value: status,
								title: status.charAt(0).toUpperCase() + status.slice(1),
							})),
						]}
					/>
				</div>
				<EmptyData
					title="No Payout History"
					text="You don't have any payout history yet"
					className="!justify-start py-10 border border-dashed border-neutral-300 rounded-lg"
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filter */}
			<div className="flex justify-end">
				<SelectBox
					name="status_filter"
					value={statusFilter}
					onchange={(value: string) => {
						setStatusFilter(value);
						setPage(1);
					}}
					containerStyle="!w-fit"
					options={[
						{ value: "all", title: "All Status" },
						...PAYOUT_STATUS.map((status: string) => ({
							value: status,
							title: status.charAt(0).toUpperCase() + status.slice(1),
						})),
					]}
				/>
			</div>

			{/* Table */}
			<div className="overflow-x-auto border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Event Name</TableHead>
							<TableHead>Total Revenue</TableHead>
							<TableHead>Collection Fee</TableHead>
							<TableHead>Payout Amount</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Requested Date</TableHead>
							<TableHead>Paid Date</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{payouts.map((payout) => {
							const currency =
								currencies.find((c) => c.id === payout.currency_id)?.symbol ||
								activeCurrency.symbol;
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
										{payout.requested_at ? getDateAndTime(payout.requested_at).date : "-"}
									</TableCell>
									<TableCell>
										{payout.paid_at ? getDateAndTime(payout.paid_at).date : "-"}
									</TableCell>
									<TableCell>
										{canDispute(payout.status) ? (
											<AppButton variant="outline" onClick={() => onDispute(payout)}>
												Dispute
											</AppButton>
										) : (
											"-"
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{data && totalPages > 1 && <Pagination {...data} />}
		</div>
	);
}
