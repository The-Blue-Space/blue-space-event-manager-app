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
import { CheckCircle2, XCircle, Clock, RotateCcw, Ban } from "lucide-react";

import TableActions from "./table-actions";
import { Order } from "@/types/order.types";
import truncate from "@/lib/truncate";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";
import { getDateAndTime } from "@/lib/format-date";

type TableProps = {
	data: Order[];
	isEmpty: boolean;
	onViewDetails?: (orderId: string) => void;
};

export default function OrdersTable(props: TableProps) {
	const { activeCurrency } = useAppSelector("init");

	if (props.isEmpty)
		return (
			<EmptyData
				title="No Orders yet"
				text="Orders made will be seen here. Check back later."
				className="!justify-start pt-10"
			/>
		);

	const getStatusConfig = (status: Order["payment_status"]) => {
		switch (status) {
			case "paid":
				return {
					icon: <CheckCircle2 className="h-3 w-3" />,
					className: "bg-success-100 text-success-500 border-success-200",
					label: "Paid",
				};
			case "pending":
				return {
					icon: <Clock className="h-3 w-3" />,
					className: "bg-warning-100 text-warning-500 border-warning-200",
					label: "Pending",
				};
			case "failed":
			case "refunded":
				return {
					icon:
						status === "failed" ? (
							<XCircle className="h-3 w-3" />
						) : (
							<RotateCcw className="h-3 w-3" />
						),
					className: "bg-error-100 text-error-500 border-error-200",
					label: status === "failed" ? "Failed" : "Refunded",
				};

			case "cancelled":
				return {
					icon: <Ban className="h-3 w-3" />,
					className: "bg-neutral-200 text-neutral-600 border-neutral-300",
					label: "Cancelled",
				};
			default:
				return {
					icon: <Clock className="h-3 w-3" />,
					className: "bg-neutral-200 text-neutral-600 border-neutral-300",
					label: status,
				};
		}
	};

	return (
		<Table>
			<TableHeader className="!bg-neutral-200/50">
				<TableRow className="caption-standard whitespace-nowrap !text-neutral-700 [&_th]:!text-left">
					<TableHead>Order ID</TableHead>
					<TableHead>Event Name</TableHead>
					<TableHead>Username</TableHead>
					<TableHead>Quantity</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Paid At</TableHead>
					<TableHead>Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{props.data.map((item) => {
					const statusConfig = getStatusConfig(item.payment_status);
					const currency = activeCurrency.symbol;

					const customerUsername = item.user?.username || "";

					const createdAt = getDateAndTime(item.created_at, {
						dateOptions: {
							dateStyle: "medium",
						},
						timeOptions: {
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						},
					});

					const paidAt = item.paid_at
						? getDateAndTime(item.paid_at, {
								dateOptions: {
									dateStyle: "medium",
								},
								timeOptions: {
									hour: "2-digit",
									minute: "2-digit",
									hour12: true,
								},
						  })
						: null;

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
										{createdAt.date} {createdAt.time}
									</span>
								</div>
							</TableCell>
							<TableCell>
								<span className="body-3 font-medium">{truncate(item.event_name ?? "", 20)}</span>
							</TableCell>

							<TableCell>
								<div className="flex flex-col">
									{customerUsername && (
										<span className="body-3 text-neutral-500">@{customerUsername}</span>
									)}
								</div>
							</TableCell>

							<TableCell>
								<span className="body-3 font-medium">{item.quantity}</span>
							</TableCell>

							<TableCell>
								<div className="flex flex-col">
									<span className="body-3 font-semibold text-neutral-900">
										{currency} {amountSeparator(item.amount)}
									</span>
									{item.discount_amount && item.discount_amount > 0 && (
										<span className="body-3 text-success-500">
											-{currency} {amountSeparator(item.discount_amount)}
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
								{paidAt ? (
									<div className="flex flex-col">
										<span className="body-3 text-neutral-700">{paidAt.date}</span>
										<span className="body-3 text-neutral-500">{paidAt.time}</span>
									</div>
								) : (
									<span className="body-3 text-neutral-400">-</span>
								)}
							</TableCell>

							<TableCell onClick={(e) => e.stopPropagation()}>
								<TableActions id={item.id} onViewDetails={props.onViewDetails} />
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
