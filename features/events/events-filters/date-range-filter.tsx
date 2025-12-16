import * as React from "react";
import { FilterFormProps } from "./use-events-filter";
import { DateInput } from "@/components/app/form-input";
import classNames from "classnames";

export default React.memo(function DateRangeFilter(props: FilterFormProps) {
	const dateRange = React.useMemo(() => {
		return {
			start_date: props.formData.start_date ?? "",
			end_date: props.formData.end_date ?? "",
		};
	}, [props.formData.start_date, props.formData.end_date]);

	const change = (type: keyof typeof dateRange, value: string) => {
		props.change(type, value);
	};

	const placeholders: Record<keyof typeof dateRange, string> = {
		start_date: "Start Date",
		end_date: "End Date",
	};

	return (
		<div className="col-span-full">
			<span className="mb-1 text-gray-500 text-b-2">Date Range</span>
			<div className="flex items-center gap-0 border rounded-lg">
				{Object.entries(dateRange).map(([key, value], index) => {
					const itemKey = key as keyof typeof dateRange;
					const triggerCn = classNames("!outline-none w-full border-0 !rounded-lg px-2", {
						"!rounded-r-none": index === 0,
						"!rounded-l-none border-l": index === Object.entries(dateRange).length - 1,
					});
					return (
						<div className="w-full overflow-auto hide-scrollbar" key={key}>
							<DateInput
								value={value ? new Date(value) : undefined}
								onChange={(e) => change(itemKey, e.toISOString())}
								placeholder={placeholders[itemKey]}
								triggerStyle={triggerCn}
								containerStyle="!border-none !outline-none rounded-none "
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
});

// <div className="space-y-3">
// 	<div className="space-y-2">
// 		<Label htmlFor="date_from">From Date</Label>
// 		<Input
// 			id="date_from"
// 			type="date"
// 			value={props.formData.date_from}
// 			onChange={(e) => props.change("date_from", e.target.value)}
// 			disabled={props.isLoading}
// 		/>
// 	</div>
// 	<div className="space-y-2">
// 		<Label htmlFor="date_to">To Date</Label>
// 		<Input
// 			id="date_to"
// 			type="date"
// 			value={props.formData.date_to}
// 			onChange={(e) => props.change("date_to", e.target.value)}
// 			disabled={props.isLoading}
// 		/>
// 	</div>
// </div>
