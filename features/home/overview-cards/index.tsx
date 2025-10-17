"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Ticket, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { HomeProps } from "../index";
import { calculatePercentage } from "@/lib/calculate-percentage";
import useAppSelector from "@/store/hooks";
import Render from "@/components/app/render";

export default function OverviewCards({ isLoading, data }: HomeProps) {
	const overview = data?.overview;

	const eventsData = {
		total: overview?.total_events.total_events || 0,
		active: overview?.total_events.upcoming_events || 0,
		icon: Calendar,
		color: "text-primary-500",
		bgColor: "bg-primary-500/10",
	};

	const attendeesData = {
		total: overview?.total_attendees.total_attendees || 0,
		thisMonth: overview?.total_attendees.attendees_this_month || 0,
		icon: Users,
		color: "text-accent-500",
		bgColor: "bg-accent-500/10",
		trend: calculatePercentage(
			overview?.total_attendees.attendees_this_month || 0,
			overview?.total_attendees.total_attendees || 0
		),
	};

	const ticketsData = {
		total: overview?.ticket_sales.ticket_sales || 0,
		thisMonth: overview?.ticket_sales.ticket_sales_this_month || 0,
		icon: Ticket,
		color: "text-success-500",
		bgColor: "bg-success-500/10",
		trend: calculatePercentage(
			overview?.ticket_sales.ticket_sales_this_month || 0,
			overview?.ticket_sales.ticket_sales || 0
		),
	};

	const revenueData = {
		total: overview?.revenue.total_revenue || 0,
		thisMonth: overview?.revenue.revenue_this_month || 0,
		icon: DollarSign,
		color: "text-warning-500",
		bgColor: "bg-warning-500/10",
		trend: calculatePercentage(
			overview?.revenue.revenue_this_month || 0,
			overview?.revenue.total_revenue || 0
		),
	};

	return (
		<div className="flex gap-5 py-1 overflow-auto snap-x snap-mandatory hide-scrollbar w-full">
			<Render isLoading={isLoading} loadingComponent={<LoadingComponent />}>
				<MetricCard
					title="Total Events"
					value={eventsData.total}
					subtitle={`${eventsData.active} upcoming`}
					icon={eventsData.icon}
					color={eventsData.color}
					bgColor={eventsData.bgColor}
				/>
				<MetricCard
					title="Total Attendees"
					value={attendeesData.total}
					subtitle={`${attendeesData.thisMonth.toLocaleString()} this month`}
					icon={attendeesData.icon}
					color={attendeesData.color}
					bgColor={attendeesData.bgColor}
					trend={attendeesData.trend}
				/>
				<MetricCard
					title="Tickets Sold"
					value={ticketsData.total}
					subtitle={`${ticketsData.thisMonth.toLocaleString()} this month`}
					icon={ticketsData.icon}
					color={ticketsData.color}
					bgColor={ticketsData.bgColor}
					trend={ticketsData.trend}
				/>
				<MetricCard
					title="Total Revenue"
					value={revenueData.total}
					subtitle={`$${revenueData.thisMonth.toLocaleString()} this month`}
					icon={revenueData.icon}
					color={revenueData.color}
					bgColor={revenueData.bgColor}
					trend={revenueData.trend}
					isRevenue
				/>
			</Render>
		</div>
	);
}

function LoadingComponent() {
	return (
		<>
			{[1, 2, 3, 4].map((i) => (
				<Card key={i} className="w-full min-w-[280px]  lg:min-w-0 snap-start">
					<CardContent className="p-6 w-full min-w-[280px]  lg:min-w-0 snap-start">
						<div className="flex items-center justify-between mb-4">
							<Skeleton className="h-4 w-20 mb-4" />
							<Skeleton className="h-4 w-10 mb-4" />
						</div>
						<Skeleton className="h-8 w-24 mb-2" />
						<Skeleton className="h-3 w-32" />
					</CardContent>
				</Card>
			))}
		</>
	);
}

type MetricCardProps = {
	title: string;
	value: number;
	subtitle: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgColor: string;
	trend?: number;
	isRevenue?: boolean;
};

function MetricCard({
	title,
	value,
	subtitle,
	icon: Icon,
	color,
	bgColor,
	trend,
	isRevenue,
}: MetricCardProps) {
	const { activeCurrency } = useAppSelector("init");
	const currency = activeCurrency?.symbol;
	const trendIcon = trend !== undefined && trend > 0 ? TrendingUp : TrendingDown;
	const trendColor = trend !== undefined && trend > 0 ? "text-success-500" : "text-error-500";
	const TrendIcon = trendIcon;

	return (
		<Card className="hover:shadow-md transition-shadow  w-full min-w-[280px]  lg:min-w-0 snap-start">
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-4">
					<p className="text-sm font-medium text-primary-500">{title}</p>
					<div className={`p-2.5 rounded-lg ${bgColor}`}>
						<Icon className={`h-5 w-5 ${color}`} />
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="text-2xl font-bold text-primary-500">
						{isRevenue && currency}
						{value.toLocaleString()}
					</h3>
					<div className="flex items-center justify-between">
						<p className="text-xs text-neutral-500">{subtitle}</p>
						{trend !== undefined && (
							<div className={`flex items-center gap-1 ${trendColor}`}>
								<TrendIcon className="h-3 w-3" />
								<span className="text-xs font-medium">{Math.abs(trend).toFixed(1)}%</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
