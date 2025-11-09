"use client";

import { UserTicket } from "@/types/user-ticket.types";
import { getDateAndTime } from "@/lib/format-date";
import { Check, X, Calendar, Clock, TicketCheck } from "lucide-react";

type TicketStatusProps = {
	ticket: UserTicket;
};

export default function TicketStatus({ ticket }: TicketStatusProps) {
	const purchaseDate = getDateAndTime(ticket.created_at);
	const usedDate = ticket.used_at ? getDateAndTime(ticket.used_at) : null;

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<TicketCheck className="w-5 h-5 text-accent-500" />
				<h3 className="body-1 font-semibold text-neutral-900">Ticket Status</h3>
			</div>
			<div className="space-y-3 bg-neutral-50 p-4 rounded-lg">
				<div className="space-y-3">
					{/* Purchase Date */}
					<div className="flex items-start gap-3">
						<Calendar className="w-4 h-4 text-neutral-500 mt-1" />
						<div className="flex-1">
							<p className="text-xs text-neutral-500">Purchase Date</p>
							<p className="text-sm text-neutral-900">{purchaseDate.date}</p>
							<p className="text-xs text-neutral-500">{purchaseDate.time}</p>
						</div>
					</div>

					{/* Used Status */}
					<div className="flex items-start gap-3">
						{ticket.is_used ? (
							<Check className="w-4 h-4 text-success-500 mt-1" />
						) : (
							<X className="w-4 h-4 text-neutral-400 mt-1" />
						)}
						<div className="flex-1">
							<p className="text-xs text-neutral-500">Usage Status</p>
							<p
								className={`text-sm font-medium ${
									ticket.is_used ? "text-success-500" : "text-neutral-500"
								}`}
							>
								{ticket.is_used ? "Ticket Used" : "Not Used Yet"}
							</p>
						</div>
					</div>

					{/* Used Date (if applicable) */}
					{ticket.is_used && usedDate && (
						<div className="flex items-start gap-3">
							<Clock className="w-4 h-4 text-neutral-500 mt-1" />
							<div className="flex-1">
								<p className="text-xs text-neutral-500">Used On</p>
								<p className="text-sm text-neutral-900">{usedDate.date}</p>
								<p className="text-xs text-neutral-500">{usedDate.time}</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
