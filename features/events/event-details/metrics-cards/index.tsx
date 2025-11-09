"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, RefreshCcw } from "lucide-react";
import { EventMetrics } from "@/types/event.types";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";
import Render from "@/components/app/render";

type MetricsCardsProps = {
	metrics: EventMetrics | undefined;
	isLoading: boolean;
};

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
	const cardsData = [
		{
			title: "Total Revenue",
			value: metrics?.total_revenue || 0,
			subtitle: `Tickets Sold ${metrics?.total_tickets_sold.toLocaleString() || 0}`,
			icon: DollarSign,
			color: "text-success-500",
			bgColor: "bg-success-500/10",
			isRevenue: true,
		},
		{
			title: "Participants",
			value: metrics?.total_participants || 0,
			subtitle: `Total Uploads ${metrics?.total_uploads || 0}`,
			icon: Users,
			color: "text-primary-500",
			bgColor: "bg-primary-500/10",
			isRevenue: false,
		},

		{
			title: "Total Refunds",
			value: metrics?.total_refund_amount || 0,
			subtitle: `Total refunds ${metrics?.total_refunds.toLocaleString() || 0}`,
			icon: RefreshCcw,
			color: "text-error-500",
			bgColor: "bg-error-500/10",
			isRevenue: true,
		},
	];

	return (
		<div className="flex gap-5 py-1 overflow-auto snap-x snap-mandatory hide-scrollbar w-full">
			<Render isLoading={isLoading} loadingComponent={<LoadingComponent />}>
				{cardsData.map((card, index) => (
					<MetricCard
						key={index}
						title={card.title}
						value={card.value}
						subtitle={card.subtitle}
						icon={card.icon}
						color={card.color}
						bgColor={card.bgColor}
						isRevenue={card.isRevenue}
					/>
				))}
			</Render>
		</div>
	);
}

type MetricCardProps = {
	title: string;
	value: number;
	subtitle: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	isRevenue: boolean;
};

function MetricCard({
	title,
	value,
	subtitle,
	icon: Icon,
	color,
	bgColor,
	isRevenue,
}: MetricCardProps) {
	const { activeCurrency } = useAppSelector("init");
	const currency = activeCurrency?.symbol;

	return (
		<Card className="hover:shadow-md transition-shadow w-full min-w-[280px] lg:min-w-0 snap-start">
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium text-primary-500">{title}</p>
					<div className={`p-2.5 rounded-lg ${bgColor}`}>
						<Icon className={`h-5 w-5 ${color}`} />
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="body-1 font-bold text-primary-500">
						{isRevenue && currency}
						{isRevenue ? amountSeparator(value) : value.toLocaleString()}
					</h3>
					<p className="text-xs text-neutral-500">{subtitle}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function LoadingComponent() {
	return (
		<>
			{[1, 2, 3, 4, 5].map((i) => (
				<Card key={i} className="w-full min-w-[280px]  lg:min-w-0 snap-start">
					<CardContent className="p-6">
						<Skeleton className="h-4 w-20 mb-4" />
						<Skeleton className="h-8 w-24 mb-2" />
						<Skeleton className="h-3 w-32" />
					</CardContent>
				</Card>
			))}
		</>
	);
}
