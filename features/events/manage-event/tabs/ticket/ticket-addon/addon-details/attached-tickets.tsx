import { EventTicket } from "@/types/event-ticket.types";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AttachedTicketsProps = {
	tickets: EventTicket[];
};

export default function AttachedTickets({ tickets }: AttachedTicketsProps) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Ticket className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Attached Tickets</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{tickets.length === 0 ? (
					<p className="body-3 text-neutral-500">
						This is a standalone addon (not attached to any tickets)
					</p>
				) : (
					<div className="space-y-2">
						{tickets.map((ticket) => (
							<div
								key={ticket.id}
								className="flex items-center justify-between border-b border-neutral-200 pb-2 last:border-0"
							>
								<span className="body-3 font-medium text-neutral-900">{ticket.name}</span>
								<Badge variant="outline" className="text-xs">
									{ticket.type}
								</Badge>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
