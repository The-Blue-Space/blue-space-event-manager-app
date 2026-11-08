import { EventTicket } from "@/types/event-ticket.types";
import { Link2, Unlink } from "lucide-react";
import { ticketTypes } from "../../data";
import { cn } from "@/lib/utils";
import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";

type AttachedTicketsProps = {
	tickets: EventTicket[];
};

export default function AttachedTickets({ tickets }: AttachedTicketsProps) {
	const { activeCurrency } = useAppSelector("init");

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Link2 className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Attached Tickets</h3>
			</div>

			{tickets.length === 0 ? (
				<div className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 bg-neutral-50">
					<span className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-200 shrink-0">
						<Unlink className="w-4 h-4 text-neutral-400" />
					</span>
					<div>
						<p className="body-3 font-medium text-neutral-700">Standalone addon</p>
						<p className="text-[11px] text-neutral-400">
							Available for purchase independently, not tied to a specific ticket
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-2">
					{tickets.map((ticket) => {
						const typeInfo = ticketTypes.find((t) => t.value === ticket.type);
						const sym = ticket.currency?.symbol ?? activeCurrency.symbol;
						return (
							<div
								key={ticket.id}
								className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50"
							>
								<span
									className={cn(
										"flex items-center justify-center w-8 h-8 rounded-full shrink-0",
										typeInfo?.badgeBg ?? "bg-neutral-200"
									)}
								>
									{typeInfo?.smallIcon}
								</span>
								<div className="flex-1 min-w-0">
									<p className="body-3 font-semibold text-neutral-900 truncate">
										{ticket.name}
									</p>
									<p className="text-[11px] text-neutral-400 capitalize">{ticket.type}</p>
								</div>
								<span className="body-3 font-medium text-neutral-700 shrink-0">
									{ticket.type === "paid" && ticket.price != null
										? `${sym} ${amountSeparator(ticket.price)}`
										: ticket.type}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
