import AppButton from "@/components/app/app-button";
import AppDropdown from "@/components/app/app-dropdown";
import { ListFilter } from "lucide-react";
import * as React from "react";
import EventFilter from "./event-filter";
import StatusFilter from "./status-filter";
import RefundTypeFilter from "./refund-type-filter";
import { FilterFormData } from "./use-refunds-filter";

type Props = {
	formData: FilterFormData;
	change: (key: keyof FilterFormData, value: string) => void;
	isLoading: boolean;
	reset: () => void;
	submit: () => void;
	events?: Array<{ id: string; title: string }>;
};

export default function Filters(props: Props) {
	const { formData, change, isLoading, reset, submit, events } = props;

	const handleSubmit = () => {
		submit();
	};

	const handleReset = () => {
		reset();
	};

	return (
		<AppDropdown
			position="bottom"
			triggerStyle="lg:w-auto !w-fit"
			contentStyle="w-fit lg:w-96 shadow-md space-y-5"
			align="start"
			trigger={
				<div className="flex gap-2 items-center text-neutral-500 border rounded-lg py-2 px-3  shadow-sm">
					<ListFilter size={16} />
					<span className="text-b-2">Filter</span>
				</div>
			}
		>
			<div className="grid grid-cols-1 gap-4 px-3 py-4">
				<EventFilter formData={formData} change={change} isLoading={isLoading} events={events} />
				<StatusFilter formData={formData} change={change} isLoading={isLoading} />
				<RefundTypeFilter formData={formData} change={change} isLoading={isLoading} />

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
