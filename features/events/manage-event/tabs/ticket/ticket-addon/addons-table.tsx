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
import AddonTableActions from "./addon-table-actions";
import { EventTicketAddon } from "@/types/event-ticket.types";
import useAppSelector from "@/store/hooks";
import { getDateAndTime } from "@/lib/format-date";
import { amountSeparator } from "@/lib/amount-separator";
import { EventTicket } from "@/types/event-ticket.types";
import truncate from "@/lib/truncate";

type AddonsTableProps = {
	data: EventTicketAddon[];
	tickets: EventTicket[];
	isEmpty: boolean;
	onViewDetails?: (addonId: string) => void;
	onEdit?: (addon: EventTicketAddon) => void;
	onToggleStatus?: (addonId: string, isActive: boolean) => Promise<void>;
	onDelete?: (addonId: string) => void;
};

export default function AddonsTable({
	data,
	tickets,
	isEmpty,
	onViewDetails,
	onEdit,
	onToggleStatus,
	onDelete,
}: AddonsTableProps) {
	const { activeCurrency, currencies } = useAppSelector("init");

	if (isEmpty)
		return (
			<EmptyData
				title="No Addons yet"
				text="Create addons to sell additional items or services for your event. Click Add Addon to get started."
				className="!justify-start pt-10"
			/>
		);

	const getAttachedTicketsDisplay = (addon: EventTicketAddon) => {
		const badgeCn = classNames("body-3 px-1 text-neutral-500");
		if (!addon.ticket_ids || addon.ticket_ids.length === 0) {
			return (
				<Badge variant="outline" className={badgeCn}>
					Standalone
				</Badge>
			);
		}
		const attachedTickets = tickets.filter((t) => addon.ticket_ids?.includes(t.id));
		if (attachedTickets.length === 0) {
			return <span className="text-xs text-neutral-400">-</span>;
		}
		if (attachedTickets.length <= 2) {
			return (
				<div className="flex flex-wrap gap-1 w-fit">
					{attachedTickets.map((t) => (
						<Badge key={t.id} variant="outline" className={badgeCn}>
							{truncate(t.name, 25)}
						</Badge>
					))}
				</div>
			);
		}
		return (
			<div className="flex flex-wrap gap-1 w-fit text-neutral-500">
				{attachedTickets.slice(0, 2).map((t) => (
					<Badge key={t.id} variant="outline" className={badgeCn}>
						{truncate(t.name, 25)}
					</Badge>
				))}
				<Badge variant="outline" className={badgeCn}>
					+{attachedTickets.length - 2} more
				</Badge>
			</div>
		);
	};

	return (
		<Table>
			<TableHeader className="!bg-neutral-200/50">
				<TableRow className="caption-standard whitespace-nowrap !text-neutral-700 [&_th]:!text-left">
					<TableHead>Addon Name/Type</TableHead>
					<TableHead>Price</TableHead>
					<TableHead>Attached Tickets</TableHead>
					<TableHead>Sales Start Date</TableHead>
					<TableHead>Sales End Date</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((addon) => {
					const addonTypeCn = classNames(
						"body-3 flex items-center gap-1 border capitalize w-fit px-1",
						{
							" text-success-700 border-success-200": addon.type === "paid",
							" text-neutral-700 border-neutral-300": addon.type === "free",
							" text-error-400 border-error-300": addon.type === "donation",
						}
					);

					const salesStart = addon.sales_start_date
						? getDateAndTime(addon.sales_start_date, {
								dateOptions: { dateStyle: "medium" },
						  })
						: null;
					const salesEnd = addon.sales_end_date
						? getDateAndTime(addon.sales_end_date, {
								dateOptions: { dateStyle: "medium" },
						  })
						: null;
					const currency = addon.currency_id
						? currencies.find((c) => c.id === addon.currency_id)?.symbol || activeCurrency.symbol
						: activeCurrency.symbol;

					return (
						<TableRow
							key={addon.id}
							className="body-3 whitespace-nowrap !text-neutral-700 [&_td]:!py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
							onDoubleClick={() => onViewDetails?.(addon.id)}
						>
							<TableCell>
								<div className="flex flex-col gap-1">
									<h6 className="body-3 font-medium text-neutral-900">
										{truncate(addon.name, 25)}
									</h6>
									<Badge variant="outline" className={addonTypeCn}>
										{addon.type}
									</Badge>
								</div>
							</TableCell>
							<TableCell>
								{addon.type === "paid" ? (
									<div className="flex flex-col">
										<span className="body-3 font-medium">
											{currency} {amountSeparator(addon.price || 0)}
										</span>
									</div>
								) : (
									<Badge variant="outline" className=" text-neutral-500 body-3 capitalize p-1">
										{addon.type}
									</Badge>
								)}
							</TableCell>

							<TableCell>{getAttachedTicketsDisplay(addon)}</TableCell>

							<TableCell>
								{salesStart && (
									<div className="flex flex-col">
										<span className="text-xs text-neutral-700">{salesStart.date}</span>
										<span className="text-xs text-neutral-500">
											{addon.sales_start_time ?? "---:---"}
										</span>
									</div>
								)}
							</TableCell>

							<TableCell>
								{salesEnd && (
									<div className="flex flex-col">
										<span className="text-xs text-neutral-700">{salesEnd.date}</span>
										<span className="text-xs text-neutral-500">
											{addon.sales_end_time ?? "---:---"}
										</span>
									</div>
								)}
							</TableCell>

							<TableCell>
								<Badge
									className={classNames("px-1", {
										"bg-success-100 text-success-500 border-success-200": addon.is_active,
										"bg-neutral-100 text-neutral-500 border-neutral-200": !addon.is_active,
									})}
								>
									{addon.is_active ? "Active" : "Inactive"}
								</Badge>
							</TableCell>

							<TableCell onClick={(e) => e.stopPropagation()}>
								<AddonTableActions
									addon={addon}
									onViewDetails={onViewDetails}
									onEdit={onEdit}
									onToggleStatus={onToggleStatus}
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
