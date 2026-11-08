"use client";

import { useQuery } from "@tanstack/react-query";
import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import TicketInformation from "./ticket-information";
import PricingDetails from "./pricing-details";
import SalesDetails from "./sales-details";
import PromoInformation from "./promo-information";
import { EventTicket } from "@/types/event-ticket.types";
import React from "react";

type TicketDetailsDrawerProps = {
	ticketId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
	onEdit: (ticket: EventTicket) => void;
	onToggleStatus: (ticketId: string, isActive: boolean) => Promise<void>;
};

export default function TicketDetailsDrawer({
	ticketId,
	open,
	onOpenChange,
	eventId,
	onEdit,
	onToggleStatus,
}: TicketDetailsDrawerProps) {
	const [isToggling, setIsToggling] = React.useState(false);

	const {
		data: tickets,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event-tickets", eventId],
		queryFn: () => getEventTickets({ event_Id: eventId }),
		enabled: !!eventId && open,
	});

	const ticket = tickets?.find((t) => t.id === ticketId);

	const handleToggle = async () => {
		if (!ticket) return;
		setIsToggling(true);
		try {
			await onToggleStatus(ticket.id, !ticket.is_active);
		} finally {
			setIsToggling(false);
		}
	};

	return (
		<AppDrawer
			title="Ticket Details"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
			footer={
				ticket ? (
					<div className="flex items-center justify-between border-t border-neutral-200 pt-2">
						<AppButton
							variant="outline"
							onClick={() => {
								onOpenChange(false);
								onEdit(ticket);
							}}
						>
							Edit Ticket
						</AppButton>
						<AppButton
							variant={ticket.is_active ? "outline" : "primary"}
							isLoading={isToggling}
							onClick={handleToggle}
						>
							{ticket.is_active ? "Deactivate" : "Activate"}
						</AppButton>
					</div>
				) : undefined
			}
		>
			{isLoading ? (
				<div className="space-y-6 p-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : error ? (
				<div className="flex flex-col items-center justify-center py-12 text-center px-6">
					<XCircle className="h-12 w-12 text-error-500 mb-4" />
					<p className="text-sm text-neutral-600">Failed to load ticket details</p>
				</div>
			) : ticket ? (
				<div className="space-y-6 p-6">
					<TicketInformation ticket={ticket} />
					<Separator />
					<PricingDetails ticket={ticket} />
					<Separator />
					<SalesDetails ticket={ticket} />
					{ticket.event_ticket_promo && (
						<>
							<Separator />
							<PromoInformation ticket={ticket} />
						</>
					)}
				</div>
			) : null}
		</AppDrawer>
	);
}
