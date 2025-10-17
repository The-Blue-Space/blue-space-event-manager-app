import AppDropdown from "@/components/app/app-dropdown";
import { ListFilter } from "lucide-react";
import * as React from "react";
import useTableFilter from "./use-table-filter";
import StatusFilter from "./status-filter";
import AppButton from "@/components/app/app-button";

export type FilterProps = {
	disabled: boolean;
};

export default React.memo(function TableFilter(props: FilterProps) {
	const { formData, change, submit, reset, isLoading } = useTableFilter();

	return (
		<div>
			<AppDropdown
				position="bottom"
				disabled={props.disabled}
				contentStyle="w-80 shadow-md space-y-5"
				sideOffset={15}
				align="start"
				trigger={
					<div className="flex gap-2 items-center text-neutral-500">
						<ListFilter size={16} />

						<span className="text-b-2">Filter</span>
					</div>
				}
			>
				<div className="flex flex-col gap-2 px-2 py-3">
					<StatusFilter formData={formData} change={change} isLoading={isLoading} />
				</div>

				<div className="flex items-center justify-between [&_button]:w-1/3 [&_button]:p-2 px-2 py-3 ">
					<AppButton variant="outline" onClick={reset} disabled={isLoading}>
						Reset
					</AppButton>
					<AppButton variant="black" onClick={submit} isLoading={isLoading}>
						Apply
					</AppButton>
				</div>
			</AppDropdown>
		</div>
	);
});
