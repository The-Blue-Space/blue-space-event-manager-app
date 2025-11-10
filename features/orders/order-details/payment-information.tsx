import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order.types";
import classNames from "classnames";
import { Ban, RotateCcw, Clock, CreditCard, XCircle, CheckCircle2 } from "lucide-react";

type Prop = {
	order: Order;
};
export default function PaymentInformation({ order }: Prop) {
	const getStatusConfig = (status?: string) => {
		switch (status) {
			case "paid":
				return {
					icon: <CheckCircle2 className="h-4 w-4" />,
					className: "bg-success-100 text-success-500 border-success-200",
					label: "Paid",
				};
			case "pending":
				return {
					icon: <Clock className="h-4 w-4" />,
					className: "bg-warning-100 text-warning-500 border-warning-200",
					label: "Pending",
				};
			case "failed":
				return {
					icon: <XCircle className="h-4 w-4" />,
					className: "bg-error-100 text-error-500 border-error-200",
					label: "Failed",
				};
			case "refunded":
				return {
					icon: <RotateCcw className="h-4 w-4" />,
					className: "bg-primary-100 text-primary-500 border-primary-200",
					label: "Refunded",
				};
			case "cancelled":
				return {
					icon: <Ban className="h-4 w-4" />,
					className: "bg-neutral-200 text-neutral-600 border-neutral-300",
					label: "Cancelled",
				};
			default:
				return {
					icon: <Clock className="h-4 w-4" />,
					className: "bg-neutral-200 text-neutral-600 border-neutral-300",
					label: status || "Unknown",
				};
		}
	};

	const statusConfig = getStatusConfig(order?.payment_status);
	const info = {
		order_ID: order.id,
		payment_reference: order.payment_reference,
		payment_status: (
			<Badge
				className={classNames("body-3 flex items-center gap-1 border", statusConfig.className)}
			>
				{statusConfig.icon}
				{statusConfig.label}
			</Badge>
		),
		payment_method: order.payment_method,
	};
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-neutral-900">
				<CreditCard className="h-4 w-4 text-accent-500" />
				<h3 className="font-semibold text-sm">Payment Information</h3>
			</div>
			<div className="bg-neutral-50 rounded-lg p-4 space-y-3">
				{Object.entries(info)
					.filter((item) => item[1] !== undefined && item[1] !== null)
					.map(([key, value]) => (
						<div className="flex items-center justify-between" key={key}>
							<span className="body-3 text-neutral-600 capitalize">{key.split("_").join(" ")}</span>
							<span className="body-3 font-mono font-medium text-neutral-900">{value}</span>
						</div>
					))}
			</div>
		</div>
	);
}
