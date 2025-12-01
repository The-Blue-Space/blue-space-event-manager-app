"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

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

import getMetricsData from "@/services/metrics/get-growth-data";
import { MetricType, MetricPeriod, MetricDataPoint } from "@/types/metrics.types";
import SelectBox from "@/components/app/form-input/select-box";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/app/error-boundary";
import EmptyData from "@/components/app/empty-data";

const currentColor = "#8180C8";
const previousColor = "#FFB703";

const chartConfig = {
	current: {
		label: "Current",
		color: currentColor,
	},
	previous: {
		label: "Previous",
		color: previousColor,
	},
} satisfies ChartConfig;

export default function GrowthCharts() {
	const [metricType, setMetricType] = useState<MetricType>("participants");
	const [period, setPeriod] = useState<MetricPeriod>("1y");

	const { data, isFetching, isError } = useQuery({
		queryKey: ["growth-metrics", metricType, period],
		queryFn: () => getMetricsData({ type: metricType, period }),
		select: (data) => {
			// Check if data is null/undefined or all values are zero
			if (!data) {
				return { hasNoData: true } as any;
			}

			const isAllZero =
				data.summary.current_total === 0 &&
				data.summary.previous_total === 0 &&
				data.current.every((item: any) => item.value === 0) &&
				data.previous.every((item: any) => item.value === 0);

			return { ...data, hasNoData: isAllZero };
			// return data;
		},
	});

	const chartData =
		data?.current?.map((item: MetricDataPoint, index: number) => ({
			label: item.label,
			current: item.value,
			previous: data.previous[index]?.value || 0,
		})) || [];

	const getTrendIcon = () => {
		if (!data) return null;

		switch (data?.summary?.trend) {
			case "up":
				return <TrendingUp className="h-4 w-4" />;
			case "down":
				return <TrendingDown className="h-4 w-4" />;
			case "stable":
				return <Minus className="h-4 w-4" />;
		}
	};

	const trendCn = cn("flex items-center gap-1 body-3", {
		"text-error-500": data?.summary?.trend === "down",
		"text-success-500": data?.summary?.trend === "up",
		"text-neutral-500": data?.summary?.trend === "stable",
	});

	const metricsOptions = [
		{ title: "Ticket Sales", value: "ticket_sales" },
		{ title: "Participants", value: "participants" },
		{ title: "Activities", value: "activities" },
	];
	const periodOptions = [
		{ title: "Year", value: "1y" },
		{ title: "6 Months", value: "6m" },
		{ title: "Month", value: "1m" },
		{ title: "Week", value: "1w" },
		{ title: "Day", value: "1d" },
	];

	if (isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Error Loading Data</CardTitle>
					<CardDescription>Failed to load metrics data. Please try again.</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<ErrorBoundary>
			<div className="flex flex-col gap-5">
				<Card
					className={cn("pt-0", {
						"min-h-96": data?.hasNoData,
					})}
				>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-primary-500">
							Growth Overview <TrendingUp className="h-4 w-4" />
						</CardTitle>
						<CardDescription>Select a metric and period to view the data</CardDescription>
						<div className="flex gap-2">
							<SelectBox
								className="w-[160px]"
								options={metricsOptions}
								value={metricType}
								onchange={(value) => setMetricType(value as MetricType)}
							/>
							<SelectBox
								className="w-[130px]"
								options={periodOptions}
								value={period}
								onchange={(value) => setPeriod(value as MetricPeriod)}
							/>
						</div>
					</CardHeader>
					<CardContent className="flex-1 overflow-y-auto">
						{isFetching ? (
							<div className="space-y-2">
								<Skeleton className="h-[300px] w-full" />
							</div>
						) : data?.hasNoData ? (
							<EmptyData
									iconType="analytics"
									showIcon={false}
								text="No metrics available yet, check back later"
								className="flex items-center justify-center pt-20"
							/>
						) : (
							<ChartContainer config={chartConfig}>
								<LineChart
									accessibilityLayer
									data={chartData}
									margin={{
										left: 12,
										right: 12,
									}}
								>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="label"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={(value: string) => {
											// For month names, show first 3 letters
											if (period === "1y" || period === "6m") {
												return value.toString().slice(0, 3);
											}
											return value;
										}}
									/>

									<ChartTooltip cursor={true} content={<ChartTooltipContent />} />
									<Line
										dataKey="current"
										type="monotone"
										stroke={currentColor}
										strokeWidth={2}
										dot={false}
									/>
									<Line
										dataKey="previous"
										type="monotone"
										stroke={previousColor}
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ChartContainer>
						)}
					</CardContent>
					{data && !data.hasNoData && (
						<CardFooter>
							<div className="flex w-full items-start gap-2 text-sm">
								<div className="grid gap-2">
									<div className="flex items-center gap-2 font-medium leading-none">
										{data.summary?.trend === "up"
											? "Trending up"
											: data.summary?.trend === "down"
											? "Trending down"
											: "Stable"}{" "}
										by{" "}
										<span className={trendCn}>
											{data.summary?.percentage_change?.toFixed(1)}% {getTrendIcon()}
										</span>
									</div>
									<div className="flex items-center gap-2 leading-none text-muted-foreground">
										{data.period_label?.current}: {data.summary?.current_total.toLocaleString()} |{" "}
										{data.period_label?.previous}: {data.summary?.previous_total.toLocaleString()}
									</div>
								</div>
							</div>
						</CardFooter>
					)}
				</Card>
			</div>
		</ErrorBoundary>
	);
}
