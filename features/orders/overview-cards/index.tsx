import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrdersMetrics } from "@/services/orders";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, CheckCircle, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewCards() {
	const { data: metrics, isLoading } = useQuery({
		queryKey: ["orders-metrics"],
		queryFn: () => getOrdersMetrics({}),
	});

	if (isLoading) {
		return (
			<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton
						key={i}
						className="h-24 w-full min-w-[280px] lg:min-w-0 snap-start rounded-lg"
					/>
				))}
			</div>
		);
	}

	const cards = [
		{
			title: "Total Orders",
			value: metrics?.total_orders || 0,
			icon: Package,
			iconColor: "text-primary-600",
			iconBgColor: "bg-primary-100/50",
		},
		{
			title: "Pending Orders",
			value: metrics?.pending_orders || 0,
			icon: Clock,
			iconColor: "text-warning-600",
			iconBgColor: "bg-warning-100/50",
		},
		{
			title: "Paid Orders",
			value: metrics?.paid_orders || 0,
			icon: CheckCircle,
			iconColor: "text-success-600",
			iconBgColor: "bg-success-100/50",
		},
		{
			title: "Refunded Orders",
			value: metrics?.refunded_orders || 0,
			icon: RefreshCcw,
			iconColor: "text-error-600",
			iconBgColor: "bg-error-100/50",
		},
	];

	return (
		<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
			{cards.map((card, index) => (
				<OverviewCard key={index} {...card} />
			))}
		</div>
	);
}

type OverviewCardProps = {
	title: string;
	value: string | number;
	icon: React.ElementType;
	iconColor?: string;
	iconBgColor?: string;
};

const OverviewCard = React.memo(function OverviewCard({
	title,
	value,
	icon: Icon,
	iconColor = "text-primary-600",
	iconBgColor = "bg-primary-100",
}: OverviewCardProps) {
	return (
		<Card className="overflow-hidden hover:shadow-md transition-all duration-300 w-full min-w-[280px] lg:min-w-0 snap-start">
			<CardContent className="p-5">
				<div className="flex items-center justify-between gap-3">
					<div className="flex-1">
						<p className="body-2 font-medium text-primary-500 mb-1">{title}</p>
						<h3 className="heading-7 font-bold text-primary-500">{value}</h3>
					</div>
					<div className={`p-3 rounded-lg ${iconBgColor}`}>
						<Icon className={`w-6 h-6 ${iconColor}`} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
});
