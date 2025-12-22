"use client";

import { Refund } from "@/types/refund.types";
import { getDateAndTime } from "@/lib/format-date";
import { CheckCircle2, Clock, XCircle, RotateCcw, Ban } from "lucide-react";
import classNames from "classnames";

type Props = {
	refund: Refund;
};

type TimelineItem = {
	label: string;
	timestamp: string | null;
	icon: React.ReactNode;
	iconBg: string;
	user?: string;
};

export default function RefundTimeline({ refund }: Props) {
	const formatDate = (date: string | null | undefined) => {
		if (!date) return null;
		const { date: d, time } = getDateAndTime(date, {
			dateOptions: { dateStyle: "medium" },
			timeOptions: { hour: "2-digit", minute: "2-digit", hour12: true },
		});
		return `${d} at ${time}`;
	};

	const timelineItems: TimelineItem[] = [
		{
			label: "Requested",
			timestamp: refund.requested_at,
			icon: <Clock className="h-4 w-4 text-white" />,
			iconBg: "bg-warning-500",
			user: refund.requested_by?.name,
		},
	];

	if (refund.approved_at) {
		timelineItems.push({
			label: "Approved",
			timestamp: refund.approved_at,
			icon: <CheckCircle2 className="h-4 w-4 text-white" />,
			iconBg: "bg-primary-500",
			user: refund.approved_by?.name,
		});
	}

	if (refund.processed_at) {
		timelineItems.push({
			label: "Processing Started",
			timestamp: refund.processed_at,
			icon: <RotateCcw className="h-4 w-4 text-white" />,
			iconBg: "bg-primary-500",
		});
	}

	if (refund.completed_at) {
		timelineItems.push({
			label: "Completed",
			timestamp: refund.completed_at,
			icon: <CheckCircle2 className="h-4 w-4 text-white" />,
			iconBg: "bg-success-500",
		});
	}

	if (refund.rejected_at) {
		timelineItems.push({
			label: "Rejected",
			timestamp: refund.rejected_at,
			icon: <Ban className="h-4 w-4 text-white" />,
			iconBg: "bg-error-500",
			user: refund.rejected_by?.name,
		});
	}

	if (refund.status === "failed" && !refund.rejected_at) {
		timelineItems.push({
			label: "Failed",
			timestamp: refund.updated_at,
			icon: <XCircle className="h-4 w-4 text-white" />,
			iconBg: "bg-error-500",
		});
	}

	return (
		<div className="space-y-4">
			<h3 className="body-1 font-semibold text-neutral-900">Timeline</h3>

			<div className="space-y-4">
				{timelineItems.map((item, index) => (
					<div key={index} className="flex gap-3">
						<div className="flex flex-col items-center">
							<div
								className={classNames(
									"w-8 h-8 rounded-full flex items-center justify-center",
									item.iconBg
								)}
							>
								{item.icon}
							</div>
							{index < timelineItems.length - 1 && (
								<div className="w-0.5 h-full min-h-[24px] bg-neutral-200 mt-2" />
							)}
						</div>
						<div className="flex-1 pb-4">
							<p className="body-2 font-medium text-neutral-900">{item.label}</p>
							{item.timestamp && (
								<p className="body-3 text-neutral-500">{formatDate(item.timestamp)}</p>
							)}
							{item.user && (
								<p className="body-3 text-neutral-500">by {item.user}</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
