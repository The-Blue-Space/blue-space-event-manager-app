"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FinanceDashboard } from "@/types/finance.types";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";
import Render from "@/components/app/render";

type OverviewCardsProps = {
	data: FinanceDashboard | undefined;
	isLoading: boolean;
};

export default function OverviewCards({ data, isLoading }: OverviewCardsProps) {
	const { activeCurrency } = useAppSelector("init");

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
			<Render isLoading={isLoading} loadingComponent={<LoadingComponent />}>
				<MetricCard
					title="Total Inflow"
					value={data?.total_inflow || 0}
					subtitle={`Withdrawable: ${activeCurrency?.symbol}${amountSeparator(
						data?.withdrawable_inflow || 0
					)}`}
					icon={TrendingUp}
					color="text-success-500"
					bgColor="bg-success-500/10"
				/>
				<MetricCard
					title="Total Outflow"
					value={data?.total_outflow || 0}
					subtitle={`Pending: ${activeCurrency?.symbol}${amountSeparator(
						data?.pending_payout_amount || 0
					)}`}
					icon={TrendingDown}
					color="text-warning-500"
					bgColor="bg-warning-500/10"
				/>
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
};

function MetricCard({ title, value, subtitle, icon: Icon, color, bgColor }: MetricCardProps) {
	const { activeCurrency } = useAppSelector("init");
	const currency = activeCurrency?.symbol;

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
						{currency}
						{value.toLocaleString()}
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
			{[1, 2].map((i) => (
				<Card key={i} className="w-full">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-10 w-10 rounded-lg" />
						</div>
						<Skeleton className="h-8 w-32 mb-2" />
						<Skeleton className="h-3 w-40" />
					</CardContent>
				</Card>
			))}
		</>
	);
}
