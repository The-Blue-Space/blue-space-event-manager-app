import { Separator } from "@/components/ui/separator";
import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";
import { Order } from "@/types/order.types";
import { DollarSign } from "lucide-react";

type Prop = {
	order: Order;
};
export default function AmountDetails({ order }: Prop) {
	const { activeCurrency } = useAppSelector("init");

	const info = {
		quantity: `${order.quantity} ${order.quantity > 1 ? "tickets" : "ticket"}`,
		amount_paid: `${activeCurrency.symbol} ${amountSeparator(order.amount)}`,
		discount_amount: order.discount_amount
			? `-${activeCurrency.symbol} ${amountSeparator(order.discount_amount ?? 0)}`
			: undefined,
		free_tickets: order.free_ticket_quantity ? order.free_ticket_quantity : undefined,
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<DollarSign className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Amount Details</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{Object.entries(info)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="text-xs text-neutral-600 capitalize">{key.split("_").join(" ")}</span>
							<span className="text-xs font-medium text-neutral-900">{value}</span>
						</div>
					))}

				<Separator />
				<div className="flex items-center justify-between">
					<span className="text-sm font-semibold text-neutral-900">Total Amount</span>
					<span className="text-sm font-bold text-neutral-900">
						{activeCurrency.symbol} {amountSeparator(order.amount - (order.discount_amount || 0))}
					</span>
				</div>
			</div>
		</div>
	);
}
