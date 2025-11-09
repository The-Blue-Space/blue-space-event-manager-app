"use client";

import { UserTicket } from "@/types/user-ticket.types";
import { Badge } from "@/components/ui/badge";
import { EventTicketAddon } from "@/types/event-ticket.types";
import classNames from "classnames";
import { Package } from "lucide-react";

type TicketAddonsProps = {
	ticket: UserTicket;
};

export default function TicketAddons({ ticket }: TicketAddonsProps) {
	const addons = ticket.ticket_addons || [];

	// Don't render if no addons
	if (!addons || addons.length === 0) {
		return null;
	}

	const getTypeBadgeColor = (type: EventTicketAddon["type"]) => {
		switch (type) {
			case "paid":
				return "bg-green-500/10 text-green-700 border-green-500/20";
			case "free":
				return "bg-blue-500/10 text-blue-700 border-blue-500/20";
			case "donation":
				return "bg-purple-500/10 text-purple-700 border-purple-500/20";
			default:
				return "bg-neutral-500/10 text-neutral-700 border-neutral-500/20";
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Package className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Ticket Addons</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{addons.map((addon, index) => (
					<div
						key={addon.id}
						className={classNames(
							"space-y-2",
							index !== addons.length - 1 && "pb-3 border-b border-neutral-200"
						)}
					>
						<div className="flex items-center justify-between">
							<span className="body-3 text-neutral-600">Addon Name</span>
							<span className="body-3 font-medium text-neutral-900 max-w-[60%] text-right break-words">
								{addon.name}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="body-3 text-neutral-600">Addon Type</span>
							<Badge
								variant="outline"
								className={classNames(
									"body-3 flex items-center gap-1 border",
									getTypeBadgeColor(addon.type)
								)}
							>
								{addon.type === "free" ? "Free" : addon.type === "donation" ? "Donation" : "Paid"}
							</Badge>
						</div>

						<div className="flex items-center justify-between">
							<span className="body-3 text-neutral-600">Attachment Type</span>
							<span className="body-3 font-medium text-neutral-900 max-w-[60%] text-right break-words">
								{addon.ticket_ids && addon.ticket_ids.length > 0
									? "Attached to Tickets"
									: "Standalone Addon"}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
