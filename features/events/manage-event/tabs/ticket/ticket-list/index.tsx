import EmptyData from "@/components/app/empty-data";
import Render from "@/components/app/render";
import useCustomNavigation from "@/hooks/use-navigation";
import { cn } from "@/lib/utils";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import deleteEventTicket from "@/services/events/event-tickets/delete-event-ticket";
import toggleTicketStatus from "@/services/events/event-tickets/toggle-ticket-status";
import useActions from "@/store/actions";
import { useQuery } from "@tanstack/react-query";
import { ticketTypes } from "../data";
import { EventTicket } from "@/types/event-ticket.types";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import invalidateQuery from "@/lib/invalidate-query";
import TicketsTable from "./tickets-table";
import TicketDetailsDrawer from "./ticket-details";
import { useState } from "react";
import TicketPromoCallout from "./ticket-promo-callout";

export default function TicketList() {
	const { params } = useCustomNavigation();
	const { ui } = useActions();
	const event_id = params.event_id as string;
	const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["event-tickets", event_id],
		queryFn: () => getEventTickets({ event_Id: event_id }),
		enabled: !!event_id,
	});

	const handleCreateTicket = (ticketType: string) => {
		ui.changeDialog({
			show: true,
			type: "add_event_ticket",
			data: {
				ticketType,
			},
		});
	};

	const handleEditTicket = (ticket: EventTicket) => {
		ui.changeDialog({
			show: true,
			type: "edit_event_ticket",
			data: ticket,
		});
	};

	const handleDeleteTicket = async (ticketId: string) => {
		try {
			await deleteEventTicket({ id: ticketId });
			toast.success("Ticket deleted successfully");
			invalidateQuery(["event-tickets"]);
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		}
	};

	const handleAddPromo = (ticketId?: string) => {
		if (!ticketId) {
			ui.changeDialog({
				show: true,
				type: "configure_ticket_promo",
			});

			return;
		}
		ui.changeDialog({
			show: true,
			type: "configure_ticket_promo",
			data: {
				ticketId,
			},
		});
	};

	const handleViewTicket = (ticketId: string) => {
		setSelectedTicketId(ticketId);
		setDrawerOpen(true);
	};

	const handleToggleStatus = async (ticketId: string, isActive: boolean) => {
		try {
			await toggleTicketStatus({
				id: ticketId,
				eventId: event_id,
				is_active: isActive,
			});
			toast.success(`Ticket ${isActive ? "activated" : "deactivated"} successfully`);
			// invalidateQuery(["event-tickets"]);
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
			throw err
		}
	};

	return (
		<div className="min-h-60">
			{data && data?.some((item) => !item.ticket_promo_id) ? (
				<TicketPromoCallout addPromo={handleAddPromo} />
			) : null}
			<Render isLoading={isLoading} isError={isError} error={error}>
				{data && data.length > 0 ? (
					<div className="w-full max-h-screen overflow-y-auto rounded-lg border border-neutral-200 ">
						<TicketsTable
							data={data}
							isEmpty={false}
							onViewDetails={handleViewTicket}
							onEdit={handleEditTicket}
							onToggleStatus={handleToggleStatus}
							onAddPromo={handleAddPromo}
							onDelete={handleDeleteTicket}
						/>
					</div>
				) : (
					<EmptyData
						showIcon={false}
						text="Create your first ticket. Select a ticket type to create a new ticket."
						action={
							<div className="w-full max-w-xl mx-auto px-4">
								<div className="grid grid-cols-3 gap-3">
									{ticketTypes.map((item) => (
										<button
											key={item.id}
											type="button"
											onClick={() => handleCreateTicket(item.value)}
											className={cn(
												"flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-neutral-200 bg-white text-center transition-all duration-200",
												"hover:border-primary-500 hover:bg-primary-500/5 hover:shadow-sm"
											)}
										>
											<span className={cn("flex items-center justify-center w-10 h-10 rounded-full", item.badgeBg)}>
												{item.icon}
											</span>
											<span className="body-3 font-semibold text-neutral-700">{item.name}</span>
											<span className="text-[11px] leading-snug text-neutral-400">{item.description}</span>
										</button>
									))}
								</div>
							</div>
						}
					/>
				)}
			</Render>

			{/* Ticket Details Drawer */}
			<TicketDetailsDrawer
				ticketId={selectedTicketId}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				eventId={event_id}
				onEdit={handleEditTicket}
				onToggleStatus={handleToggleStatus}
			/>
		</div>
	);
}
