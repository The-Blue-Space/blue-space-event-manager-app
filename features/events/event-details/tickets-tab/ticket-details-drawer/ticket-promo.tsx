"use client";

import { UserTicket } from "@/types/user-ticket.types";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { getDateAndTime } from "@/lib/format-date";
import { amountSeparator } from "@/lib/amount-separator";

type TicketPromoProps = {
	ticket: UserTicket;
};

export default function TicketPromo({ ticket }: TicketPromoProps) {
	const promo = ticket.ticket_promo;
	if (!promo) return null;

	const currency = ticket.ticket?.currency?.symbol || "";

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
				dateOptions: {
					dateStyle: "medium",
				},
				timeOptions: time
					? {
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
					  }
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

	const getDiscountDisplay = () => {
		if (promo.promo_type === "free_ticket") {
			return `${promo.free_ticket_quantity} Free Ticket${
				promo.free_ticket_quantity > 1 ? "s" : ""
			}`;
		}

		if (promo.discount_type === "percentage") {
			return `${promo.discount_percentage}% Off`;
		} else if (promo.discount_type === "fixed") {
			return `${currency} ${amountSeparator(promo.discount_amount)} Off`;
		}

		return "Discount";
	};

	const info: Record<string, string | React.ReactNode | undefined> = {
		promo_name: promo.name,
		promo_type: (
			<Badge
				variant="outline"
				className={
					promo.promo_type === "discount"
						? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
						: "bg-green-500/10 text-green-700 border-green-500/20"
				}
			>
				{promo.promo_type === "discount" ? "Discount" : "Free Ticket"}
			</Badge>
		),
		discount: getDiscountDisplay(),
		// status: (
		// 	<Badge
		// 		variant="outline"
		// 		className={
		// 			promo.is_active
		// 				? "bg-success-100 text-success-500 border-success-200"
		// 				: "bg-error-100 text-error-500 border-error-200"
		// 		}
		// 	>
		// 		{promo.is_active ? "Active" : "Inactive"}
		// 	</Badge>
		// ),

		promo_start_date: promoStart
			? `${promoStart.date}${promoStart.time ? ` ${promoStart.time}` : ""}`
			: undefined,
		promo_end_date: promoEnd
			? `${promoEnd.date}${promoEnd.time ? ` ${promoEnd.time}` : ""}`
			: undefined,
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<Tag className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Promo Information</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{Object.entries(info)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="body-3 text-neutral-600 capitalize">{key.split("_").join(" ")}</span>
							{typeof value === "string" ? (
								<span className="body-3 font-medium text-neutral-900 max-w-[60%] text-right break-words">
									{value}
								</span>
							) : (
								<span>{value}</span>
							)}
						</div>
					))}
			</div>
		</div>
	);
}
