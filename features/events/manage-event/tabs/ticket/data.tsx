import { EventTicketType } from "@/types/event-ticket.types";

import { CircleSlash, DollarSign, Heart } from "lucide-react";

export const ticketTypes: {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	badgeBg: string;
	value: EventTicketType;
	smallIcon: React.ReactNode;
}[] = [
	{
		id: "1",
		name: "Paid",
		description: "Create a ticket that attendees will pay to get a ticket",
		icon: <DollarSign className="w-5 h-5 text-success-700" />,
		badgeBg: "bg-success-100/50",
		value: "paid",
		smallIcon: <DollarSign className="w-3 h-3 text-success-700" />,
	},
	{
		id: "2",
		name: "Free",
		description: "Create a ticket that attendees will not pay to get a ticket",
		icon: <CircleSlash className="w-5 h-5 text-neutral-700" />,
		smallIcon: <CircleSlash className="w-3 h-3 text-neutral-700" />,
		badgeBg: "bg-neutral-200/50",
		value: "free",
	},
	{
		id: "3",
		name: "Donation",
		description: "Let attendees decide how much they will pay for a ticket",
		icon: <Heart className="w-5 h-5 text-error-600" />,
		smallIcon: <Heart className="w-3 h-3 text-error-600" />,
		badgeBg: "bg-error-200/50",
		value: "donation",
	},
];
