"use client";

import { useQuery } from "@tanstack/react-query";
import AppDrawer from "@/components/app/app-drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import TicketInformation from "./ticket-information";
import PricingDetails from "./pricing-details";
import SalesDetails from "./sales-details";
import PromoInformation from "./promo-information";

type TicketDetailsDrawerProps = {
	ticketId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
};

export default function TicketDetailsDrawer({
	ticketId,
	open,
	onOpenChange,
	eventId,
}: TicketDetailsDrawerProps) {
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

	return (
		<AppDrawer
			title="Ticket Details"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
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
					{/* Ticket Information */}
					<TicketInformation ticket={ticket} />
					<Separator />

					{/* Pricing Details */}
					<PricingDetails ticket={ticket} />
					<Separator />

					{/* Sales Details */}
					<SalesDetails ticket={ticket} />
					<Separator />

					{/* Promo Information (if available) */}
					{ticket.event_ticket_promo && (
						<>
							<PromoInformation ticket={ticket} />
							<Separator />
						</>
					)}
				</div>
			) : null}
		</AppDrawer>
	);
}
