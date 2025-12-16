"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SelectBox from "@/components/app/form-input/select-box";
import { getRevenueData } from "@/services/metrics";
import { MetricPeriod } from "@/types/metrics.types";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/app/error-boundary";
import EmptyData from "@/components/app/empty-data";

const inflowColor = "#6866bd";
const outflowColor = "#FFB703";

const chartConfig = {
	inflow: {
		label: "Inflow",
		color: inflowColor,
	},
	outflow: {
		label: "Outflow",
		color: outflowColor,
	},
} satisfies ChartConfig;

const periodOptions = [
	{ title: "Year", value: "1y" },
	{ title: "6 Months", value: "6m" },
	{ title: "Month", value: "1m" },
	{ title: "Week", value: "1w" },
	{ title: "Day", value: "1d" },
];

export default function ChartPieDonutActive() {
	const [period, setPeriod] = useState<MetricPeriod>("1y");

	const { data, isFetching, isError } = useQuery({
		queryKey: ["revenue-metrics", period],
		queryFn: () => getRevenueData({ period }),
		select: (data) => {
			// Check if data is null/undefined or all values are zero
			if (!data) {
				return { hasNoData: true } as any;
			}

			const isAllZero =
				data.inflow.current === 0 &&
				data.inflow.previous === 0 &&
				data.outflow.current === 0 &&
				data.outflow.previous === 0 &&
				data.net_balance === 0;

			return { ...data, hasNoData: isAllZero };
		},
	});

	const getTrendIcon = () => {
		if (!data) return null;
		switch (data.trend) {
			case "up":
				return <TrendingUp className="h-3 w-3" />;
			case "down":
				return <TrendingDown className="h-3 w-3" />;
			case "stable":
				return <Minus className="h-3 w-3" />;
		}
	};

	const trendCn = cn("flex items-center gap-1 body-3", {
		"text-error-500": data?.trend === "down",
		"text-success-500": data?.trend === "up",
		"text-neutral-500": data?.trend === "stable",
	});

	const chartData = data
		? [
				{ label: "inflow", value: data.inflow?.current, fill: inflowColor },
				{ label: "outflow", value: data.outflow?.current, fill: outflowColor },
		  ]
		: [];

	if (isError) {
		return (
			<Card className="flex flex-col">
				<CardHeader>
					<CardTitle>Revenue Flow</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-error-500">Failed to load revenue data.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<ErrorBoundary>
			<Card
				className={cn("flex flex-col pt-0", {
					// "min-h-96": data?.hasNoData,
				})}
			>
				<CardHeader className="flex flex-row justify-between gap-3 pb-0 items-start w-full">
					<div className="w-full">
						<CardTitle className="text-primary-500">Revenue Flow</CardTitle>
						<CardDescription className="body-3">
							View your revenue flow across periods
						</CardDescription>
					</div>
					<SelectBox
						className="w-full"
						options={periodOptions}
						value={period}
						onchange={(value) => setPeriod(value as MetricPeriod)}
					/>
				</CardHeader>
				<CardContent className="flex-1 pb-0">
					{isFetching ? (
						<div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
							<Skeleton className="w-full h-full rounded-full" />
						</div>
					) : data?.hasNoData ? (
						<EmptyData
							iconType="analytics"
							showIcon={false}
							text="No metrics available yet, check back later"
							className="flex items-center justify-center py-20"
						/>
					) : (
						<>
							<ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
								<PieChart>
									<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
									<Pie
										data={chartData}
										dataKey="value"
										nameKey="label"
										innerRadius={60}
										strokeWidth={5}
										activeIndex={0}
										activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
											<Sector {...props} outerRadius={outerRadius + 10} />
										)}
									/>
								</PieChart>
							</ChartContainer>
							{/* Legend with colors */}
							<div className="flex items-center justify-center gap-6 mt-4">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full" style={{ backgroundColor: inflowColor }} />
									<span className="text-sm font-medium text-neutral-700">Inflow</span>
									<span className="text-sm text-neutral-500">
										${data?.inflow?.current?.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full" style={{ backgroundColor: outflowColor }} />
									<span className="text-sm font-medium text-neutral-700">Outflow</span>
									<span className="text-sm text-neutral-500">
										${data?.outflow?.current?.toLocaleString()}
									</span>
								</div>
							</div>
						</>
					)}
				</CardContent>
				{data && !data.hasNoData && (
					<CardFooter className="flex-col gap-2 text-sm pt-4">
						<div className="flex items-center gap-2 leading-none font-medium">
							<span>
								{data.trend === "up"
									? "Inflow up"
									: data.trend === "down"
									? "Inflow down"
									: "Stable"}{" "}
								by
							</span>
							<span className={trendCn}>
								{data.inflow?.percentage_change?.toFixed(1)}% {getTrendIcon()}
							</span>
						</div>
						<div className="text-muted-foreground leading-none">
							Showing revenue flow for {data.period_label.current.toLowerCase()}
						</div>
					</CardFooter>
				)}
			</Card>
		</ErrorBoundary>
	);
}
