import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FilterFormProps } from "./use-refunds-filter";
import { REFUND_STATUS } from "@/types/refund.types";

type Props = Omit<FilterFormProps, "events">;

export default function StatusFilter(props: Props) {
	const { formData, change, isLoading } = props;

	const statusLabels: Record<string, string> = {
		pending: "Pending",
		approved: "Approved",
		processing: "Processing",
		completed: "Completed",
		failed: "Failed",
		rejected: "Rejected",
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="body-3 font-medium text-neutral-700">Status</label>
			<Select
				value={formData.status}
				onValueChange={(value) => change("status", value === "all" ? "" : value)}
				disabled={isLoading}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Statuses</SelectItem>
					{REFUND_STATUS.map((status) => (
						<SelectItem key={status} value={status}>
							{statusLabels[status] || status}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
