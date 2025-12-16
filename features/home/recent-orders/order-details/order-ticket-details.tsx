import Render from "@/components/app/render";
import { SkeletonList } from "@/components/ui/skeleton";
import getEventDetails from "@/services/events/get-event-details";
import getUserTicketsDetails from "@/services/tickets/get-user-tickets-details";
import { Order } from "@/types/order.types";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Ticket } from "lucide-react";

type Prop = {
	order: Order;
};
export default function OrderTicketDetails({ order }: Prop) {
	const { isFetching, isError, data } = useQuery({
		queryKey: ["order-ticket", order.user_ticket_id],
		queryFn: async () => {
			const [event, userTicket] = await Promise.all([
				getEventDetails({ id: order.event_id }),
				getUserTicketsDetails({ id: order.user_ticket_id }),
			]);
			return { event, userTicket };
		},
	});

	const event = data?.event;
	const userTicket = data?.userTicket;
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Ticket className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Event & Ticket Details</h3>
			</div>
			<Render
				isLoading={isFetching}
				isError={isError}
				loadingComponent={<SkeletonList count={4} className="w-full h-10" />}
			>
				<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
					<div>
						<span className="text-xs text-neutral-600 block mb-1">Event</span>
						<p className="text-sm font-semibold text-neutral-900">{event?.title}</p>
					</div>
					{userTicket?.ticket?.name && (
						<div>
							<span className="text-xs text-neutral-600 block mb-1">Ticket Type</span>
							<p className="text-sm font-medium text-neutral-900">{userTicket?.ticket?.name}</p>
						</div>
					)}
					{event?.address && (
						<div className="flex items-start gap-2">
							<MapPin className="h-3.5 w-3.5 text-neutral-500 mt-0.5 flex-shrink-0" />
							<span className="text-xs text-neutral-600">
								{event?.address}, {event?.city}
							</span>
						</div>
					)}
					{userTicket?.ticket_code && (
						<div>
							<span className="text-xs text-neutral-600 block mb-1">Ticket Code</span>
							<p className="text-sm font-mono font-medium text-neutral-900">
								{userTicket?.ticket_code}
							</p>
						</div>
					)}
				</div>
			</Render>
		</div>
	);
}
