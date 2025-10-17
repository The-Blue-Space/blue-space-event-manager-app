import { variables } from "@/constants";
import axios from "@/lib/axios";
import { MetricsChartData, MetricType, MetricPeriod } from "@/types/metrics.types";

type Parameters = {
	type: MetricType;
	period: MetricPeriod;
};

type Response = MetricsChartData;

export async function production(params: Parameters): Promise<Response> {
	const response = await axios.get(`/v1/dashboard/metrics/chart`, {
		params: {
			type: params.type,
			period: params.period,
		},
	});
	return response.data.data;
}

export async function development(params: Parameters): Promise<Response> {
	// Generate mock data based on period
	const generateMockData = (period: MetricPeriod) => {
		switch (period) {
			case "1y": {
				const months = [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec",
				];
				return {
					labels: months,
					current: months.map(() => Math.floor(Math.random() * 1000) + 1000),
					previous: months.map(() => Math.floor(Math.random() * 1000) + 800),
				};
			}
			case "6m": {
				const currentDate = new Date();
				const months = [];
				for (let i = 5; i >= 0; i--) {
					const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
					months.push(date.toLocaleString("default", { month: "short" }));
				}
				return {
					labels: months,
					current: months.map(() => Math.floor(Math.random() * 1000) + 1000),
					previous: months.map(() => Math.floor(Math.random() * 1000) + 800),
				};
			}
			case "1m": {
				const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
				return {
					labels: weeks,
					current: weeks.map(() => Math.floor(Math.random() * 500) + 300),
					previous: weeks.map(() => Math.floor(Math.random() * 500) + 200),
				};
			}
			case "1w": {
				const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
				return {
					labels: days,
					current: days.map(() => Math.floor(Math.random() * 200) + 100),
					previous: days.map(() => Math.floor(Math.random() * 200) + 80),
				};
			}
			case "1d": {
				const hours = Array.from({ length: 12 }, (_, i) => {
					const hour = i * 2;
					return `${hour.toString().padStart(2, "0")}:00`;
				});
				return {
					labels: hours,
					current: hours.map(() => Math.floor(Math.random() * 100) + 20),
					previous: hours.map(() => Math.floor(Math.random() * 100) + 10),
				};
			}
		}
	};

	const mockData = generateMockData(params.period);
	const currentTotal = mockData.current.reduce((sum, val) => sum + val, 0);
	const previousTotal = mockData.previous.reduce((sum, val) => sum + val, 0);
	const percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;

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

	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					period: params.period,
					type: params.type,
					period_label: getPeriodLabels(params.period),
					current: mockData.labels.map((label, index) => ({
						label,
						value: mockData.current[index],
					})),
					previous: mockData.labels.map((label, index) => ({
						label,
						value: mockData.previous[index],
					})),
					summary: {
						current_total: currentTotal,
						previous_total: previousTotal,
						percentage_change: Math.abs(percentageChange),
						trend: percentageChange > 5 ? "up" : percentageChange < -5 ? "down" : "stable",
					},
				}),
			1500
		);
	});
}

export default async function getMetricsData(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);

	return production(params);
}
