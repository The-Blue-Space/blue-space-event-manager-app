export const METRIC_TYPES = ["ticket_sales", "participants", "activities"] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

export const METRIC_PERIODS = ["1y", "6m", "1m", "1w", "1d"] as const;
export type MetricPeriod = (typeof METRIC_PERIODS)[number];

export type MetricDataPoint = {
	label: string;
	value: number;
};

export type MetricPeriodLabel = {
	current: string;
	previous: string;
};

export type MetricSummary = {
	current_total: number;
	previous_total: number;
	percentage_change: number;
	trend: "up" | "down" | "stable";
};

export type MetricsChartData = {
	period: MetricPeriod;
	type: MetricType;
	period_label: MetricPeriodLabel;
	current: MetricDataPoint[];
	previous: MetricDataPoint[];
	summary: MetricSummary;
};
