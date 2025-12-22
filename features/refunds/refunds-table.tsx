"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import classNames from "classnames";
import EmptyData from "@/components/app/empty-data";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, RotateCcw, Ban, Loader2 } from "lucide-react";

import TableActions from "./table-actions";
import { Refund } from "@/types/refund.types";
import truncate from "@/lib/truncate";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";
import { getDateAndTime } from "@/lib/format-date";

type TableProps = {
	data: Refund[];
	isEmpty: boolean;
	onViewDetails?: (refundId: string) => void;
	onApprove?: (refundId: string) => void;
	onReject?: (refundId: string) => void;
};

export default function RefundsTable(props: TableProps) {
	const { activeCurrency } = useAppSelector("init");

	if (props.isEmpty)
		return (
			<EmptyData
				title="No Refunds yet"
				text="Refund requests will appear here. Check back later."
				className="!justify-start py-10"
			/>
		);

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

	const getRefundTypeLabel = (type: Refund["refund_type"]) => {
		switch (type) {
			case "ticket":
				return "Ticket";
			case "vendor":
				return "Vendor";
			default:
				return type;
		}
	};

	return (
		<Table>
			<TableHeader className="!bg-neutral-200/50">
				<TableRow className="caption-standard whitespace-nowrap !text-neutral-700 [&_th]:!text-left">
					<TableHead>Refund ID</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Event</TableHead>
					<TableHead>Customer</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Requested At</TableHead>
					<TableHead>Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{props.data.map((item) => {
					const statusConfig = getStatusConfig(item.status);
					const currency = activeCurrency.symbol;

					const customerName = item.user?.name || "";

					const requestedAt = getDateAndTime(item.requested_at, {
						dateOptions: {
							dateStyle: "medium",
						},
						timeOptions: {
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						},
					});

					return (
						<TableRow
							key={item.id}
							className="body-3 whitespace-nowrap !text-neutral-700 [&_td]:!py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
							onClick={() => props.onViewDetails?.(item.id)}
						>
							<TableCell>
								<div className="flex flex-col">
									<h6 className="font-medium body-3 text-neutral-900">{truncate(item.id, 12)}</h6>
									<span className="body-3 text-neutral-500">
										{requestedAt.date}
									</span>
								</div>
							</TableCell>

							<TableCell>
								<Badge
									variant="outline"
									className="body-3 capitalize"
								>
									{getRefundTypeLabel(item.refund_type)}
								</Badge>
							</TableCell>

							<TableCell>
								<span className="body-3 font-medium">{truncate(item.event?.title ?? "-", 20)}</span>
							</TableCell>

							<TableCell>
								<div className="flex flex-col">
									{customerName && (
										<span className="body-3 text-neutral-700">{customerName}</span>
									)}
									{item.user?.email && (
										<span className="body-3 text-neutral-500">{truncate(item.user.email, 20)}</span>
									)}
								</div>
							</TableCell>

							<TableCell>
								<div className="flex flex-col">
									<span className="body-3 font-semibold text-neutral-900">
										{currency} {amountSeparator(item.refund_amount / 100)}
									</span>
									{item.refund_fee > 0 && (
										<span className="body-3 text-neutral-500">
											Fee: {currency} {amountSeparator(item.refund_fee / 100)}
										</span>
									)}
								</div>
							</TableCell>

							<TableCell>
								<Badge
									className={classNames(
										"body-3 flex items-center gap-1 w-fit border",
										statusConfig.className
									)}
								>
									{statusConfig.icon}
									{statusConfig.label}
								</Badge>
							</TableCell>

							<TableCell>
								<div className="flex flex-col">
									<span className="body-3 text-neutral-700">{requestedAt.date}</span>
									<span className="body-3 text-neutral-500">{requestedAt.time}</span>
								</div>
							</TableCell>

							<TableCell onClick={(e) => e.stopPropagation()}>
								<TableActions
									id={item.id}
									status={item.status}
									onViewDetails={props.onViewDetails}
									onApprove={props.onApprove}
									onReject={props.onReject}
								/>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
