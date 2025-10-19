import AppButton from "@/components/app/app-button";
import AppDropdown from "@/components/app/app-dropdown";
import { ListFilter } from "lucide-react";
import * as React from "react";
import AccessTypeFilter from "./access-type-filter";
import CategoryFilter from "./category-filter";
import DateRangeFilter from "./date-range-filter";
import SortFilter from "./sort-filter";
import StatusFilter from "./status-filter";
import { FilterFormData } from "./use-events-filter";

type Props = {
	formData: FilterFormData;
	change: (key: keyof FilterFormData, value: string) => void;
	isLoading: boolean;
	reset: () => void;
	submit: () => void;
};

export default function Filters(props: Props) {
	const { formData, change, isLoading, reset, submit } = props;
	const [open, setOpen] = React.useState(false);
	const handleSubmit = () => {
		submit();
		setOpen(false);
	};

	const handleReset = () => {
		reset();
		setOpen(false);
	};
	return (
		<AppDropdown
			open={open}
			position="bottom"
			// disabled={props.disabled}
			triggerStyle="lg:w-auto !w-fit"
			contentStyle="w-fit lg:w-96 shadow-md space-y-5"
			// sideOffset={15}
			align="start"
			trigger={
				<div
					onClick={() => setOpen(true)}
					className="flex gap-2 items-center text-neutral-500 border rounded-lg  px-2 shadow-sm"
				>
					<ListFilter size={16} />

					<span className="text-b-2">Filter</span>
				</div>
			}
		>
			<div className="grid grid-cols-2 gap-4 px-3 py-4">
				<CategoryFilter formData={formData} change={change} isLoading={isLoading} />
				<AccessTypeFilter formData={formData} change={change} isLoading={isLoading} />
				<StatusFilter formData={formData} change={change} isLoading={isLoading} />
				<SortFilter formData={formData} change={change} isLoading={isLoading} />
				<DateRangeFilter formData={formData} change={change} isLoading={isLoading} />

				<div className="flex items-center gap-2 border-t pt-3 col-span-full">
					<AppButton
						variant="outline"
						onClick={handleReset}
						disabled={isLoading}
						className="flex-1"
					>
						Reset
					</AppButton>

					<AppButton
						variant="black"
						onClick={handleSubmit}
						isLoading={isLoading}
						className="flex-1"
					>
						Apply
					</AppButton>
				</div>
			</div>
		</AppDropdown>
	);
}
