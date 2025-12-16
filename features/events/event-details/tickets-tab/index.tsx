"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import getEventUserTickets from "@/services/events/get-event-user-tickets";
import revokeUserTicket from "@/services/events/revoke-user-ticket";
import { Event } from "@/types/event.types";
import { UserTicket } from "@/types/user-ticket.types";
import TicketsTable from "./tickets-table";
import TicketDetailsDrawer from "./ticket-details-drawer";
import TableSearchBar from "./table-header/table-search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyData from "@/components/app/empty-data";
import { toast } from "sonner";
import invalidateQuery from "@/lib/invalidate-query";
import useActions from "@/store/actions";
import Pagination from "@/components/app/pagination";
import useCustomNavigation from "@/hooks/use-navigation";
import logger from "@/lib/app-logger";

type TicketsTabProps = {
	event: Event;
};

export default function TicketsTab({ event }: TicketsTabProps) {
	const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const { ui } = useActions();
	const { queryParams } = useCustomNavigation();
	const page = queryParams.get("page");
	const search = queryParams.get("search");

	// Check if event is ticket-based (before any hooks)
	const isTicketBased = event.access_type === "ticket-based";

	const { data, isLoading } = useQuery({
		queryKey: ["event-user-tickets", event.id, page, search],
		queryFn: () =>
			getEventUserTickets({
				eventId: event.id,
				page: page ? Number(page) : undefined,
				limit: 10,
				search: search || undefined,
			}),
		enabled: !!event.id && isTicketBased,
	});

	const tickets = data?.docs || [];
	const totalPages = data?.totalPages || 1;

	const handleViewDetails = (ticket: UserTicket) => {
		setSelectedTicket(ticket);
		setDrawerOpen(true);
	};

	const handleRevoke = (ticket: UserTicket) => {
		ui.changeDialog({
			show: true,
			type: "delete_dialog",
			staticData: {
				title: "Revoke Ticket",
				text: "Are you sure you want to revoke this ticket? This action cannot be undone.",
				showTitle: true,
				showText: true,
				showActionButton: true,
				showDismissButton: true,
				actionButtonText: "Revoke",
				dismissButtonText: "Cancel",
				actionButtonVariant: "destructive",
				dismissAfterAction: true,
			},
			action: async () => {
				try {
					await revokeUserTicket({ eventId: event.id, ticketId: ticket.id });
					toast.success("Ticket revoked successfully");
					invalidateQuery(["event-user-tickets"]);
				} catch (error: any) {
					toast.error(error?.message || "Failed to revoke ticket");
				}
			},
		});
	};

	// Return early for non-ticket-based events
	if (!isTicketBased) {
		return (
			<div className="p-8 text-center border border-neutral-200 rounded-lg">
				<p className="text-neutral-600">
					This event uses <span className="font-semibold">{event.access_type}</span> access type.
				</p>
				<p className="text-sm text-neutral-500 mt-2">Tickets are not applicable for this event.</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="border rounded-lg p-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="mb-4 last:mb-0">
							<Skeleton className="h-12 w-full" />
						</div>
					))}
				</div>
			</div>
		);
	}

    const handleSearch = (query: string) => {
        if (query) {
            logger.log("handleSearch", query);
			queryParams.set("search", query);
			// Reset to page 1 when searching
			// queryParams.delete("page");
		} else {
			queryParams.delete("search");
		}
	};

	if (tickets.length === 0 && !search) {
		return (
			<EmptyData
				title="No Tickets Found"
				text="No tickets have been purchased for this event yet."
				className="py-12 border border-neutral-200 rounded-lg"
			/>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<TableSearchBar onSearch={handleSearch} />

			{/* Tickets Table */}
			{tickets.length === 0 && search ? (
				<EmptyData
					title="No Results Found"
					text="No tickets match your search query."
					className="py-12 border border-neutral-200 rounded-lg"
				/>
			) : (
				<TicketsTable tickets={tickets} onViewDetails={handleViewDetails} onRevoke={handleRevoke} />
			)}

			{/* Pagination */}
			{data && totalPages > 1 && <Pagination {...data} />}

			{/* Ticket Details Drawer */}
			<TicketDetailsDrawer ticket={selectedTicket} open={drawerOpen} onOpenChange={setDrawerOpen} />
		</div>
	);
}
