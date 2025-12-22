import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FilterFormProps } from "./use-refunds-filter";
import { REFUND_TYPE } from "@/types/refund.types";

type Props = Omit<FilterFormProps, "events">;

export default function RefundTypeFilter(props: Props) {
	const { formData, change, isLoading } = props;

	const typeLabels: Record<string, string> = {
		ticket: "Ticket Refund",
		vendor: "Vendor Refund",
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="body-3 font-medium text-neutral-700">Refund Type</label>
			<Select
				value={formData.refund_type}
				onValueChange={(value) => change("refund_type", value === "all" ? "" : value)}
				disabled={isLoading}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Types</SelectItem>
					{REFUND_TYPE.map((type) => (
						<SelectItem key={type} value={type}>
							{typeLabels[type] || type}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
