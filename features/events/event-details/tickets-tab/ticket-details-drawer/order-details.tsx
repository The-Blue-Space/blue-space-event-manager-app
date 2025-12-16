import { amountSeparator } from "@/lib/amount-separator";
import { getDateAndTime } from "@/lib/format-date";
import useAppSelector from "@/store/hooks";
import { UserTicket } from "@/types/user-ticket.types";
import { DollarSign } from "lucide-react";

type Prop = {
	ticket: UserTicket;
};

export default function OrderDetails({ ticket }: Prop) {
	const { activeCurrency } = useAppSelector("init");

	if (!ticket.ticket_payment) return null;

	const payment = ticket.ticket_payment;

	const mergeTimeAndDate = (data: string) => {
		const date = getDateAndTime(data, {
			dateOptions: { dateStyle: "medium" },
			timeOptions: { hour: "2-digit", minute: "2-digit", hour12: true },
		});

		return `${date.date} | ${date.time}`;
	};

	const amountInfo = {
		quantity: `${payment.quantity} ${payment.quantity > 1 ? "tickets" : "ticket"}`,
		amount_paid: `${activeCurrency.symbol} ${amountSeparator(payment.amount)}`,
		discount_amount: payment.discount_amount
			? `-${activeCurrency.symbol} ${amountSeparator(payment.discount_amount ?? 0)}`
			: undefined,
		free_tickets: payment.free_ticket_quantity ? payment.free_ticket_quantity : undefined,
	};

	const timelineInfo = {
		created: mergeTimeAndDate(payment.created_at),
		paid: payment.paid_at ? mergeTimeAndDate(payment.paid_at) : null,
		refunded: payment.refunded_at ? mergeTimeAndDate(payment.refunded_at) : null,
		last_updated: mergeTimeAndDate(payment.updated_at),
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<DollarSign className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Order Details</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{/* Amount Details */}
				{Object.entries(amountInfo)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="text-xs text-neutral-600 capitalize">
								{key.split("_").join(" ")}
							</span>
							<span className="text-xs font-medium text-neutral-900">{value}</span>
						</div>
					))}

				{/* Timeline Details */}
				{Object.entries(timelineInfo)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="text-xs text-neutral-600 capitalize">
								{key.split("_").join(" ")}
							</span>
							<span className="text-xs font-medium text-neutral-900">{value}</span>
						</div>
					))}
			</div>
		</div>
	);
}
