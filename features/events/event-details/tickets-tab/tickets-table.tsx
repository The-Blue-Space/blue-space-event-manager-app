"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { UserTicket } from "@/types/user-ticket.types";
import { getDateAndTime } from "@/lib/format-date";
import TableActions from "./table-actions";
import { Check, X } from "lucide-react";
import truncate from "@/lib/truncate";

type TicketsTableProps = {
	tickets: UserTicket[];
	onViewDetails: (ticket: UserTicket) => void;
	onRevoke: (ticket: UserTicket) => void;
};

export default function TicketsTable({ tickets, onViewDetails, onRevoke }: TicketsTableProps) {
	return (
		<div className="border rounded-lg overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User Name</TableHead>
						<TableHead>Ticket Type</TableHead>
						<TableHead>Ticket Code</TableHead>
						<TableHead>Purchase Date</TableHead>
						<TableHead>Used Status</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{tickets.map((ticket) => (
						<TableRow
							key={ticket.id}
							className="cursor-pointer hover:bg-neutral-50"
							onDoubleClick={() => onViewDetails(ticket)}
						>
							<TableCell className="font-medium">
								<div>
									<p>{ticket.user?.username || "N/A"}</p>
									<p className="text-xs text-neutral-500">
										{truncate(ticket.user?.email ?? "", 20)}
									</p>
								</div>
							</TableCell>
							<TableCell>{ticket.ticket?.name || "N/A"}</TableCell>
							<TableCell>
								<code className="text-xs bg-neutral-100 px-2 py-1 rounded">
									{ticket.ticket_code}
								</code>
							</TableCell>

							<TableCell>
								<div className="flex flex-col">
									<span className="body-3 font-medium">
										{getDateAndTime(ticket.created_at).date}
									</span>
									<span className="body-3 text-neutral-500">
										{getDateAndTime(ticket.created_at).time}
									</span>
								</div>
							</TableCell>
							<TableCell>
								{ticket.is_used ? (
									<div className="flex items-center gap-1 text-success-500">
										<Check className="w-4 h-4" />
										<span className="body-3">Used</span>
									</div>
								) : (
									<div className="flex items-center gap-1 text-neutral-500">
										<X className="w-4 h-4" />
										<span className="body-3">Not Used</span>
									</div>
								)}
							</TableCell>
							<TableCell className="text-right">
								<TableActions
									onView={() => onViewDetails(ticket)}
									onRevoke={() => onRevoke(ticket)}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
