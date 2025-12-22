"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRefundsStats } from "@/services/refunds";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Clock, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";

export default function OverviewCards() {
	const { activeCurrency } = useAppSelector("init");

	const { data: stats, isLoading } = useQuery({
		queryKey: ["refunds-stats"],
		queryFn: () => getRefundsStats(),
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i} className="w-full">
						<CardContent className="p-4">
							<div className="flex items-center justify-between mb-4">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-10 w-10 rounded-lg" />
							</div>
							<Skeleton className="h-8 w-32 mb-2" />
							<Skeleton className="h-3 w-40" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	const currency = activeCurrency?.symbol || "₦";

	const cards = [
		{
			title: "Total Refunds",
			value: stats?.total_refunds || 0,
			isAmount: false,
			subtitle: "All refund requests",
			icon: RotateCcw,
			color: "text-primary-600",
			bgColor: "bg-primary-100/50",
		},
		{
			title: "Pending Refunds",
			value: stats?.pending_refund_amount || 0,
			isAmount: true,
			subtitle: `${stats?.pending_refunds || 0} pending request${(stats?.pending_refunds || 0) !== 1 ? "s" : ""}`,
			icon: Clock,
			color: "text-warning-600",
			bgColor: "bg-warning-100/50",
		},
		{
			title: "Completed Refunds",
			value: stats?.total_refunded_amount || 0,
			isAmount: true,
			subtitle: `${stats?.completed_refunds || 0} completed refund${(stats?.completed_refunds || 0) !== 1 ? "s" : ""}`,
			icon: CheckCircle,
			color: "text-success-600",
			bgColor: "bg-success-100/50",
		},
		{
			title: "Rejected Refunds",
			value: stats?.rejected_refunds || 0,
			isAmount: false,
			subtitle: "Declined requests",
			icon: XCircle,
			color: "text-error-600",
			bgColor: "bg-error-100/50",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
			{cards.map((card, index) => (
				<MetricCard key={index} {...card} currency={currency} />
			))}
		</div>
	);
}

type MetricCardProps = {
	title: string;
	value: number;
	isAmount: boolean;
	subtitle: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	currency: string;
};

function MetricCard({
	title,
	value,
	isAmount,
	subtitle,
	icon: Icon,
	color,
	bgColor,
	currency,
}: MetricCardProps) {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardContent className="p-4">
				<div className="flex items-center justify-between mb-4">
					<p className="text-sm font-medium text-primary-500">{title}</p>
					<div className={`p-2.5 rounded-lg ${bgColor}`}>
						<Icon className={`h-5 w-5 ${color}`} />
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="text-2xl font-bold text-primary-500">
						{isAmount ? (
							<>
								{currency}
								{amountSeparator(value / 100)}
							</>
						) : (
							value.toLocaleString()
						)}
					</h3>
					<p className="text-xs text-neutral-500">{subtitle}</p>
				</div>
			</CardContent>
		</Card>
	);
}
