"use client";

import AppDrawer from "@/components/app/app-drawer";
import { Separator } from "@/components/ui/separator";
import { UserTicket } from "@/types/user-ticket.types";
import TicketInformation from "./ticket-information";
import UserInformation from "./user-information";
import TicketStatus from "./ticket-status";
import TicketPromo from "./ticket-promo";
import TicketAddons from "./ticket-addons";
import OrderDetails from "./order-details";

type TicketDetailsDrawerProps = {
	ticket: UserTicket | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function TicketDetailsDrawer({
	ticket,
	open,
	onOpenChange,
}: TicketDetailsDrawerProps) {
	if (!ticket) return null;

	return (
		<AppDrawer
			title="Ticket Details"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
		>
			<div className="space-y-6 p-6">
				{/* Ticket Information */}
				<TicketInformation ticket={ticket} />

				<Separator />

				{/* Ticket Status */}
				<TicketStatus ticket={ticket} />

				<Separator />

				{/* User Information */}
				<UserInformation ticket={ticket} />

				{/* Order Details - Only show if payment exists */}
				{ticket.ticket_payment && (
					<>
						<Separator />
						<OrderDetails ticket={ticket} />
					</>
				)}

				{/* Ticket Promo - Only show if promo exists */}
				{ticket.ticket_promo && (
					<>
						<Separator />
						<TicketPromo ticket={ticket} />
					</>
				)}

				{/* Ticket Addons - Only show if addons exist */}
				{ticket.ticket_addons && ticket.ticket_addons.length > 0 && (
					<>
						<Separator />
						<TicketAddons ticket={ticket} />
					</>
				)}
			</div>
		</AppDrawer>
	);
}
