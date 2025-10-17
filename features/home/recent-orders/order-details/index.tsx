"use client";

import { useQuery } from "@tanstack/react-query";
import AppDrawer from "@/components/app/app-drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle } from "lucide-react";
import { getOrderDetails } from "@/services/orders";
import PaymentInformation from "./payment-information";
import AmountDetails from "./amount-details";
import CustomerDetails from "./customer-details";
import OrderTicketDetails from "./order-ticket-details";
import OrderTimeline from "./order-timeline";

type OrderDetailsDrawerProps = {
	orderId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function OrderDetailsDrawer({
	orderId,
	open,
	onOpenChange,
}: OrderDetailsDrawerProps) {
	const {
		data: order,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["order-details", orderId],
		queryFn: () => getOrderDetails({ orderId: orderId! }),
		enabled: !!orderId && open,
	});

	return (
		<AppDrawer
			title="Order Details"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
		>
			{isLoading ? (
				<div className="space-y-6 p-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : error ? (
				<div className="flex flex-col items-center justify-center py-12 text-center px-6">
					<XCircle className="h-12 w-12 text-error-500 mb-4" />
					<p className="text-sm text-neutral-600">Failed to load order details</p>
				</div>
			) : order ? (
				<div className="space-y-6 p-6">
					{/* Payment Information */}
					<PaymentInformation order={order} />
					<Separator />

					{/* Amount Details */}
					<AmountDetails order={order} />
					<Separator />

					{/* Customer Information */}
					<CustomerDetails order={order} />

					<Separator />

					{/* Event & Ticket Details */}
					<OrderTicketDetails order={order} />

					<Separator />

					{/* Timeline */}
					<OrderTimeline order={order} />
				</div>
			) : null}
		</AppDrawer>
	);
}
