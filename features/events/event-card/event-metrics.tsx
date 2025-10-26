import { Event } from "@/types/event.types";
import { DollarSign, Image as ImageIcon, Ticket, Users, RefreshCw } from "lucide-react";
import * as React from "react";

type EventMetricsProps = {
	event: Event;
};

export default React.memo(function EventMetrics({ event }: EventMetricsProps) {
	const isTicketBased = event.access_type === "ticket-based";

	const metrics = [
		{
			icon: Users,
			label: "Participants",
			value: (event.total_participants || 0).toLocaleString(),
		},
		{
			icon: ImageIcon,
			label: "Uploads",
			value: (event.total_uploads || 0).toLocaleString(),
		},
		...(isTicketBased && event.ticket_sold !== null && event.ticket_sold !== undefined
			? [
					{
						icon: Ticket,
						label: "Tickets",
						value: event.ticket_sold.toLocaleString(),
					},
			  ]
			: []),
		...(isTicketBased && event.total_revenue !== null && event.total_revenue !== undefined
			? [
					{
						icon: DollarSign,
						label: "Revenue",
						value: `$${((event.total_revenue || 0) / 100).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}`,
					},
			  ]
			: []),
		...(isTicketBased &&
		event.total_refunds !== null &&
		event.total_refunds !== undefined &&
		event.total_refunds > 0
			? [
					{
						icon: RefreshCw,
						label: "Refunds",
						value: `$${((event.total_refunds || 0) / 100).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}`,
					},
			  ]
			: []),
	];

	return (
		<div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-200">
			{metrics.map((metric, index) => {
				const Icon = metric.icon;
				return (
					<div key={index} className="flex items-center gap-2">
						<Icon className="w-4 h-4 text-neutral-500" />
						<div className="flex flex-col">
							<span className="text-xs text-primary-500">{metric.label}</span>
							<span className="text-sm font-semibold text-neutral-900">{metric.value}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
});
