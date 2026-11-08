import { amountSeparator } from "@/lib/amount-separator";
import { EventTicket } from "@/types/event-ticket.types";
import { DollarSign, BadgePercent } from "lucide-react";
import { getPromoPriceDisplay } from "../ticket-card-utils";
import { cn } from "@/lib/utils";

type PricingDetailsProps = {
	ticket: EventTicket;
};

export default function PricingDetails({ ticket }: PricingDetailsProps) {
	const priceInfo = getPromoPriceDisplay(ticket);
	const sym = ticket.currency?.symbol || "";
	const isFree = ticket.type === "free" || ticket.price === null || ticket.price === undefined;
	const hasPromo = !!(priceInfo.promo && priceInfo.original);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<DollarSign className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Pricing</h3>
			</div>

			{/* Featured price */}
			<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
				<div className="flex items-end justify-between">
					<div>
						<p className="body-3 text-neutral-500 mb-0.5">
							{isFree ? "Admission" : hasPromo ? "Promo price" : "Ticket price"}
						</p>
						{isFree ? (
							<p className="text-2xl font-bold text-blue-600">Free</p>
						) : hasPromo ? (
							<div className="flex items-baseline gap-2">
								<p className="text-2xl font-bold text-neutral-900">
									{sym} {amountSeparator(priceInfo.promo!)}
								</p>
								<p className="body-3 text-neutral-400 line-through">
									{sym} {amountSeparator(priceInfo.original!)}
								</p>
							</div>
						) : (
							<p className="text-2xl font-bold text-neutral-900">
								{sym} {amountSeparator(ticket.price!)}
							</p>
						)}
					</div>

					{hasPromo && (
						<span className="inline-flex items-center gap-1 body-3 font-medium rounded-full px-2.5 py-1 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20">
							<BadgePercent className="w-3.5 h-3.5" />
							Promo active
						</span>
					)}
				</div>

				{/* Secondary info */}
				<div
					className={cn(
						"mt-3 pt-3 border-t border-neutral-200 grid gap-2",
						ticket.currency?.name ? "grid-cols-2" : "grid-cols-1"
					)}
				>
					{ticket.currency?.name && (
						<div>
							<p className="text-[10px] uppercase tracking-wide text-neutral-400 font-medium">Currency</p>
							<p className="body-3 font-medium text-neutral-700">{ticket.currency.name}</p>
						</div>
					)}
					<div>
						<p className="text-[10px] uppercase tracking-wide text-neutral-400 font-medium">Fee absorption</p>
						<p className="body-3 font-medium text-neutral-700">
							{ticket.absolve_fee ? "Organiser absorbs fee" : "Attendee pays fee"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
