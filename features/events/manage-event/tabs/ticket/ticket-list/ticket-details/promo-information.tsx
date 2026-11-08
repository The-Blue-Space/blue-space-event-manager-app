import { Badge } from "@/components/ui/badge";
import { EventTicket } from "@/types/event-ticket.types";
import { Tag } from "lucide-react";
import { getDateAndTime } from "@/lib/format-date";
import { amountSeparator } from "@/lib/amount-separator";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PromoInformationProps = {
	ticket: EventTicket;
};

export default function PromoInformation({ ticket }: PromoInformationProps) {
	const promo = ticket.event_ticket_promo;
	if (!promo) return null;

	const currency = ticket.currency?.symbol || "";

	const formatPromoDate = (date: string, time?: string | null) => {
		if (!date) return null;
		try {
			let dateObj: Date;
			if (time) {
				const [hours, minutes] = time.split(":");
				dateObj = new Date(date);
				dateObj.setHours(Number(hours), Number(minutes), 0, 0);
			} else {
				dateObj = new Date(date);
			}
			return getDateAndTime(dateObj.toISOString(), {
				dateOptions: { dateStyle: "medium" },
				timeOptions: time
					? { hour: "2-digit", minute: "2-digit", hour12: true }
					: undefined,
			});
		} catch {
			return null;
		}
	};

	const promoStart = formatPromoDate(promo.sales_start_date, promo.sales_start_time);
	const promoEnd = promo.sales_end_date
		? formatPromoDate(promo.sales_end_date, promo.sales_end_time || null)
		: null;

	const promoStartLabel = promoStart
		? `${promoStart.date}${promoStart.time ? ` · ${promoStart.time}` : ""}`
		: "—";
	const promoEndLabel = promoEnd
		? `${promoEnd.date}${promoEnd.time ? ` · ${promoEnd.time}` : ""}`
		: "Open-ended";

	const getDiscountDisplay = () => {
		if (promo.promo_type === "free_ticket") {
			return `${promo.free_ticket_quantity} Free Ticket${promo.free_ticket_quantity > 1 ? "s" : ""}`;
		}
		if (promo.discount_type === "percentage") {
			return `${promo.discount_percentage}% off`;
		} else if (promo.discount_type === "fixed") {
			return `${currency} ${amountSeparator(promo.discount_amount)} off`;
		}
		return "Discount";
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-neutral-900">
					<Tag className="h-4 w-4 text-yellow-600" />
					<h3 className="font-semibold text-sm">Promo</h3>
				</div>
				<Badge
					variant="outline"
					className={cn(
						"body-3 border",
						promo.is_active
							? "bg-success-100 text-success-600 border-success-200"
							: "bg-error-100 text-error-500 border-error-200"
					)}
				>
					{promo.is_active ? "Active" : "Inactive"}
				</Badge>
			</div>

			<div className="rounded-xl border border-yellow-200 bg-yellow-500/5 p-4 space-y-3">
				{/* Promo name + discount hero */}
				<div className="flex items-start justify-between">
					<div>
						<p className="body-3 text-yellow-700/70 font-medium">
							{promo.promo_type === "discount" ? "Discount" : "Free Ticket"}
						</p>
						<p className="text-lg font-bold text-yellow-900">{promo.name}</p>
					</div>
					<span className="inline-flex items-center body-2 font-bold text-yellow-700 bg-yellow-500/10 border border-yellow-300 rounded-full px-3 py-1">
						{getDiscountDisplay()}
					</span>
				</div>

				{/* Description / note */}
				{(promo.description || promo.note) && (
					<div className="pt-2 border-t border-yellow-200 space-y-1">
						{promo.description && (
							<p className="body-3 text-yellow-800/70">{promo.description}</p>
						)}
						{promo.note && (
							<p className="body-3 italic text-yellow-700/60">{promo.note}</p>
						)}
					</div>
				)}

				{/* Purchase limits */}
				{(promo.min_purchase_quantity || promo.max_purchase_quantity) && (
					<div className="flex items-center justify-between pt-2 border-t border-yellow-200">
						<span className="body-3 text-yellow-800/70">Purchase limits</span>
						<span className="body-3 font-medium text-yellow-900">
							{promo.min_purchase_quantity ? `${promo.min_purchase_quantity} min` : ""}
							{promo.min_purchase_quantity && promo.max_purchase_quantity ? " · " : ""}
							{promo.max_purchase_quantity ? `${promo.max_purchase_quantity} max` : ""}
						</span>
					</div>
				)}

				{/* Promo window */}
				<div className="pt-2 border-t border-yellow-200 space-y-1.5">
					<span className="body-3 text-yellow-800/70">Promo window</span>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="body-3 font-medium text-yellow-900">{promoStartLabel}</span>
						<ArrowRight className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
						<span
							className={cn(
								"body-3 font-medium",
								promoEnd ? "text-yellow-900" : "text-yellow-700/50 italic"
							)}
						>
							{promoEndLabel}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
