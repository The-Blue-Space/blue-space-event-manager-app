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
import TableActions from "./table-actions";
import { EventTicket } from "@/types/event-ticket.types";
import useAppSelector from "@/store/hooks";
import { getDateAndTime } from "@/lib/format-date";
import { amountSeparator } from "@/lib/amount-separator";
import AppSwitch from "@/components/app/app-switch";
import { useState } from "react";

type TicketsTableProps = {
	data: EventTicket[];
	isEmpty: boolean;
	onViewDetails?: (ticketId: string) => void;
	onEdit?: (ticket: EventTicket) => void;
	onToggleStatus?: (ticketId: string, isActive: boolean) => Promise<void>;
	onAddPromo?: (ticketId: string) => void;
	onDelete?: (ticketId: string) => void;
};

export default function TicketsTable({
	data,
	isEmpty,
	onViewDetails,
	onEdit,
	onToggleStatus,
	onAddPromo,
	onDelete,
}: TicketsTableProps) {
	const { activeCurrency } = useAppSelector("init");
	const [ticketStatus, setTicketStatus] = useState<Record<string, boolean>>(
		data.reduce((acc, ticket) => {
			acc[ticket.id] = ticket.is_active;
			return acc;
		}, {} as Record<string, boolean>)
	);

	const handleToggleStatus = async (ticketId: string, isActive: boolean) => {
		try {
			await onToggleStatus?.(ticketId, isActive);
			setTicketStatus((prev) => ({ ...prev, [ticketId]: isActive }));
		} catch (err) {
			setTicketStatus((prev) => ({ ...prev, [ticketId]: !isActive }));
			console.error(err);
		}
	};

	if (isEmpty)
		return (
			<EmptyData
				title="No Tickets yet"
				text="Create tickets to sell for your event. Select a ticket type to get started."
				className="!justify-start pt-10"
			/>
		);

	return (
		<Table>
			<TableHeader className="!bg-neutral-200/50">
				<TableRow className="caption-standard whitespace-nowrap !text-neutral-700 [&_th]:!text-left">
					<TableHead>Ticket Name/Type</TableHead>
					{/* <TableHead>Type</TableHead> */}
					<TableHead>Quantity/Sold</TableHead>
					<TableHead>Price</TableHead>
					<TableHead>Sales Start Date</TableHead>
					<TableHead>Sales End Date</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((ticket) => {
					const ticketTypeCn = classNames(
						"body-3 flex items-center gap-1 border capitalize w-fit px-1",
						{
							" text-success-700 border-success-200": ticket.type === "paid",
							" text-neutral-700 border-neutral-300": ticket.type === "free",
							" text-error-400 border-error-300": ticket.type === "donation",
						}
					);

					const salesStart = ticket.sales_start_date
						? getDateAndTime(ticket.sales_start_date, {
								dateOptions: { dateStyle: "medium" },
						  })
						: null;
					const salesEnd = ticket.sales_end_date
						? getDateAndTime(ticket.sales_end_date, {
								dateOptions: { dateStyle: "medium" },
						  })
						: null;

					const salesStartTime = ticket.sales_start_time
						? getDateAndTime(ticket.sales_start_time, {
								timeOptions: { timeStyle: "short", hour12: true },
						  })
						: null;

					const salesEndTime = ticket.sales_end_time
						? getDateAndTime(ticket.sales_end_time, {
								timeOptions: { timeStyle: "short", hour12: true },
						  })
						: null;

					const currency = ticket.currency?.symbol || activeCurrency.symbol;

					return (
						<TableRow
							key={ticket.id}
							className="body-3 whitespace-nowrap !text-neutral-700 [&_td]:!py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
							onDoubleClick={() => onViewDetails?.(ticket.id)}
						>
							<TableCell>
								<div className="flex flex-col gap-1">
									<h6 className="font-medium text-xs text-neutral-900">{ticket.name}</h6>
									<Badge variant="outline" className={ticketTypeCn}>
										{ticket.type}
									</Badge>
								</div>
							</TableCell>

							{/* <TableCell>
								<Badge variant="outline" className={ticketTypeCn}>
									{ticket.type}
								</Badge>
							</TableCell> */}

							<TableCell>
								<div className="flex flex-col">
									<span className="body-3 font-medium">
										{ticket.unlimited_quantity
											? "Unlimited"
											: ticket.total_quantity.toLocaleString()}
									</span>
									<span className="body-3 font-medium">
										{" "}
										Sold: {`${ticket.sold_quantity.toLocaleString()}`}
									</span>
								</div>
							</TableCell>
							<TableCell>
								{ticket.type === "paid" ? (
									<div className="flex flex-col">
										<span className="body-3 font-medium">
											{currency} {amountSeparator(ticket.price || 0)}
										</span>
										{ticket.event_ticket_promo && ticket?.event_ticket_promo?.is_active && (
											<span className="body-3 font-medium">
												Promo:
												<span className="text-neutral-400 capitalize">
													{" "}
													{ticket.event_ticket_promo?.promo_type.split("_").join(" ")}
												</span>
											</span>
										)}
									</div>
								) : (
									<Badge variant="outline" className=" text-neutral-500 body-3 capitalize p-1">
										{ticket.type}
									</Badge>
								)}
							</TableCell>

							<TableCell>
								{salesStart && (
									<div className="flex flex-col">
										<span className="text-xs text-neutral-700">{salesStart.date}</span>
										<span className="text-xs text-neutral-500">
											{salesStartTime?.time ?? "---:---"}
										</span>
									</div>
								)}
							</TableCell>

							<TableCell>
								{salesEnd ? (
									<div className="flex flex-col">
										<span className="text-xs text-neutral-700">{salesEnd.date}</span>
										<span className="text-xs text-neutral-500">
											{salesEndTime?.time ?? "---:---"}
										</span>
									</div>
								) : (
									<span className="text-xs text-neutral-500">---:--- ---:---</span>
								)}
							</TableCell>

							<TableCell>
								<AppSwitch
									checked={ticketStatus[ticket.id]}
									onCheckedChange={() => handleToggleStatus(ticket.id, !ticketStatus[ticket.id])}
									variant="accent"
								/>
								{/* <Badge
									className={classNames("px-1", {
										"bg-success-100 text-success-500 border-success-200": ticket.is_active,
										"bg-neutral-100 text-neutral-500 border-neutral-200": !ticket.is_active,
									})}
								>
									{ticket.is_active ? "Active" : "Inactive"}
								</Badge> */}
							</TableCell>

							<TableCell onClick={(e) => e.stopPropagation()}>
								<TableActions
									ticket={ticket}
									onViewDetails={onViewDetails}
									onEdit={onEdit}
									onToggleStatus={onToggleStatus}
									onAddPromo={onAddPromo}
									onDelete={onDelete}
								/>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
