import { amountSeparator } from "@/lib/amount-separator";
import { EventTicket } from "@/types/event-ticket.types";
import { DollarSign } from "lucide-react";
import { getPromoPriceDisplay } from "../ticket-card-utils";

type PricingDetailsProps = {
	ticket: EventTicket;
};

export default function PricingDetails({ ticket }: PricingDetailsProps) {
	const priceInfo = getPromoPriceDisplay(ticket);
	const currency = ticket.currency?.symbol || "N/A";

	const info: Record<string, string | undefined> = {
		price:
			ticket.price !== null && ticket.price !== undefined
				? `${currency} ${amountSeparator(ticket.price)}`
				: "Free",
		currency: ticket.currency?.name || undefined,
		absolve_fee: ticket.absolve_fee ? "Yes" : "No",
	};

	if (priceInfo.promo && priceInfo.original) {
		info.original_price = `${currency} ${amountSeparator(priceInfo.original)}`;
		info.promo_price = `${currency} ${amountSeparator(priceInfo.promo)}`;
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<DollarSign className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Pricing Details</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{Object.entries(info)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="body-3 text-neutral-600 capitalize">{key.split("_").join(" ")}</span>
							<span className="body-3 font-medium text-neutral-900">{value}</span>
						</div>
					))}
			</div>
		</div>
	);
}
