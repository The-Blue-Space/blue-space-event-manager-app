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
		? currencies.find((c) => c.id === addon.currency_id) || activeCurrency
		: activeCurrency;

	const isFree = addon.type !== "paid" || addon.price === null || addon.price === undefined;

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<DollarSign className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Pricing</h3>
			</div>

			<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
				<div className="flex items-end justify-between">
					<div>
						<p className="body-3 text-neutral-500 mb-0.5">
							{isFree ? "Admission" : "Addon price"}
						</p>
						{isFree ? (
							<p className="text-2xl font-bold text-blue-600">
								{addon.type === "donation" ? "Donation" : "Free"}
							</p>
						) : (
							<p className="text-2xl font-bold text-neutral-900">
								{currency.symbol} {amountSeparator(addon.price!)}
							</p>
						)}
					</div>
				</div>

				{!isFree && (
					<div className="mt-3 pt-3 border-t border-neutral-200">
						<p className="text-[10px] uppercase tracking-wide text-neutral-400 font-medium">
							Currency
						</p>
						<p className="body-3 font-medium text-neutral-700">
							{currency.name} ({currency.symbol})
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
