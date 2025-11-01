import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";
import { EventTicketAddon } from "@/types/event-ticket.types";
import { DollarSign } from "lucide-react";

type PricingDetailsProps = {
	addon: EventTicketAddon;
};

export default function PricingDetails({ addon }: PricingDetailsProps) {
	const { currencies, activeCurrency } = useAppSelector("init");
	const currency = addon.currency_id
		? currencies.find((c) => c.id === addon.currency_id)|| activeCurrency
		: activeCurrency;

	const info: Record<string, string | undefined> = {
		price:
			addon.price !== null && addon.price !== undefined
				? `${currency.symbol} ${amountSeparator(addon.price)}`
				: "Free",
		currency: `${currency.name} (${currency.symbol})` || "N/A",
	};

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
