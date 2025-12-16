import { useEvent } from "../../context";
import { useQuery } from "@tanstack/react-query";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import { Badge } from "@/components/ui/badge";
import { PencilLine } from "lucide-react";
import AppButton from "@/components/app/app-button";
import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";
import EmptyData from "@/components/app/empty-data";

export default function TicketListSection() {
	const { event, changeTab } = useEvent();
	const { activeCurrency, currencies } = useAppSelector("init");

	const { data: tickets = [], isLoading } = useQuery({
		queryKey: ["event-tickets", event?.id],
		queryFn: () => getEventTickets({ event_Id: event?.id || "" }),
		enabled: !!event?.id,
	});

	const handleEdit = () => {
		changeTab("ticket");
	};

	if (isLoading) {
		return (
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
				<div className="animate-pulse space-y-2">
					<div className="h-4 bg-neutral-200 rounded w-1/2"></div>
					<div className="h-20 bg-neutral-200 rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
			<div className="flex items-center justify-between">
				<h3 className="body-2 font-semibold text-neutral-900">Ticket list</h3>
				<AppButton variant="outline"  onClick={handleEdit} leftIcon={<PencilLine className="w-4 h-4" />}>
					Edit
				</AppButton>
			</div>

			{tickets.length === 0 ? (
				<EmptyData
					showIcon={false}
					text="No tickets created yet. Click Edit to add tickets."
					className="!justify-start py-4"
				/>
			) : (
				<div className="space-y-2 max-h-96 overflow-y-auto">
					{tickets.map((ticket) => {
						const currency =
							currencies.find((c) => c.id === ticket.currency_id)?.symbol || activeCurrency.symbol;
						return (
							<div
								key={ticket.id}
								className="bg-white rounded border border-neutral-200 p-3 flex items-center justify-between"
							>
								<div className="flex-1 min-w-0">
									<p className="body-3 font-medium text-neutral-900 truncate">{ticket.name}</p>
									<div className="flex items-center gap-2 mt-1">
										<Badge
											variant="outline"
											className={`text-xs ${
												ticket.type === "paid"
													? "text-green-700 border-green-500/20"
													: ticket.type === "free"
													? "text-blue-700 border-blue-500/20"
													: "text-purple-700 border-purple-500/20"
											}`}
										>
											{ticket.type}
										</Badge>
										{ticket.price && ticket.currency_id ? (
											<span className="body-3 text-neutral-600">
												{currency} {amountSeparator(ticket.price)}
											</span>
										) : null}
									</div>
								</div>
								<Badge
									variant="outline"
									className={`text-xs ${
										ticket.is_active
											? "bg-success-100 text-success-500 border-success-200"
											: "bg-neutral-100 text-neutral-500 border-neutral-200"
									}`}
								>
									{ticket.is_active ? "Active" : "Inactive"}
								</Badge>
							</div>
						);
					})}
					
				</div>
			)}
		</div>
	);
}
