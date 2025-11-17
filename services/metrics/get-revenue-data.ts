import { variables } from "@/constants";
import axios from "@/lib/axios";
import { MetricPeriod } from "@/types/metrics.types";

type Parameters = {
	period: MetricPeriod;
};

export type RevenueData = {
	period: MetricPeriod;
	period_label: {
		current: string;
		previous: string;
	};
	inflow: {
		current: number;
		previous: number;
		percentage_change: number;
	};
	outflow: {
		current: number;
		previous: number;
		percentage_change: number;
	};
	net_balance: number;
	trend: "up" | "down" | "stable";
};

type Response = RevenueData;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/dashboard/metrics/revenue`, {
		params: {
			period: params.period,
		},
	});
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Generate period labels
	const getPeriodLabels = (period: MetricPeriod): { current: string; previous: string } => {
		const currentYear = new Date().getFullYear();
		switch (period) {
			case "1y":
				return { current: currentYear.toString(), previous: (currentYear - 1).toString() };
			case "6m":
				return { current: "Last 6 Months", previous: "Previous 6 Months" };
			case "1m":
				return {
					current: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
					previous: new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString(
						"default",
						{ month: "long", year: "numeric" }
					),
				};
			case "1w":
				return { current: "This Week", previous: "Last Week" };
			case "1d":
				return { current: "Today", previous: "Yesterday" };
		}
	};

	// Mock revenue data based on period
	const baseInflow = Math.floor(Math.random() * 100000) + 200000;
	const previousInflow = Math.floor(Math.random() * 80000) + 150000;
	const inflowChange = ((baseInflow - previousInflow) / previousInflow) * 100;

	const outflowPercentage = 0.35 + Math.random() * 0.15; // 35-50%
	const currentOutflow = Math.floor(baseInflow * outflowPercentage);
	const previousOutflow = Math.floor(previousInflow * outflowPercentage);

	const netBalance = baseInflow - currentOutflow;
	const trend = inflowChange > 5 ? "up" : inflowChange < -5 ? "down" : "stable";

	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					period: params.period,
					period_label: getPeriodLabels(params.period),
					inflow: {
						current: baseInflow,
						previous: previousInflow,
						percentage_change: Math.abs(inflowChange),
					},
					outflow: {
						current: currentOutflow,
						previous: previousOutflow,
						percentage_change: Math.abs(Math.random() * 100),
					},
					net_balance: netBalance,
					trend,
				}),
			1200
		);
	});
}

export default async function getRevenueData(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);

	return production(params);
}

