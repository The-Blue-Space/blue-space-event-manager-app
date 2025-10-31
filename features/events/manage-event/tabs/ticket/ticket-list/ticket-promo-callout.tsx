"use client";

import React from "react";
import AppButton from "@/components/app/app-button";
import { Rocket, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
	ticketId?: string;
	onAddPromo?: () => void;
	addPromo?: (ticketId?: string) => void;
};

export default function TicketPromoCallout({ ticketId, onAddPromo, addPromo }: Props) {
	const [dismissed, setDismissed] = React.useState(false);
	if (dismissed) return null;
	return (
		<div className="border shadow-sm bg-neutral-200/50 rounded-lg p-4 flex items-start gap-3 mb-5">
			<Badge className="bg-accent-200/30 text-accent-500 rounded-full p-2 w-10 h-10 flex items-center justify-center">
				<Rocket className="size-full " />
			</Badge>
			<div className=" flex flex-1 gap-3">
				<div>
					<p className="body-2 text-primary-500 font-medium">Boost your sales with a promo</p>
					<p className="body-3 text-neutral-600">
						Create a discount promo or a freebie(Get one free) offer to increase conversions on your
						ticket.
					</p>
				</div>
				<div className="mt-2">
					<AppButton
						variant="outline"
                        onClick={() => (onAddPromo ? onAddPromo() : addPromo?.(ticketId))}
                        className="text-accent-500 hover:text-accent-600 border-accent-500"
					>
						Create Promo
					</AppButton>
				</div>
			</div>
			<button className="p-1 rounded-full hover:bg-neutral-200" onClick={() => setDismissed(true)}>
				<X className="w-4 h-4 text-neutral-600" />
			</button>
		</div>
	);
}
