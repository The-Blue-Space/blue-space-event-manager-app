import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Table } from "lucide-react";
import * as React from "react";
import SearchFilter from "./search-filter";
import useEventsFilter from "./use-events-filter";
import Filters from "./filters";

type EventsFiltersProps = {
	viewMode: "cards" | "list" | "table";
	onViewChange: (mode: "cards" | "list" | "table") => void;
};

export default React.memo(function EventsFilters({ viewMode, onViewChange }: EventsFiltersProps) {
	const { formData, change, submit, reset, isLoading } = useEventsFilter();

	const ViewToggleButton = ({
		mode,
		icon: Icon,
		label,
	}: {
		mode: typeof viewMode;
		icon: any;
		label: string;
	}) => (
		<Button
			variant={viewMode === mode ? "default" : "outline"}
			size="sm"
			onClick={() => onViewChange(mode)}
			className="gap-2"
			title={label}
		>
			<Icon className="w-4 h-4" />
			<span className="hidden lg:inline">{label}</span>
		</Button>
	);

	return (
		<div className="space-y-4">
			{/* Search and View Toggle Row */}
			<div className="flex flex-col sm:flex-row lg:justify-between items-stretch sm:items-center gap-3">
				{/* filters */}
				<div className="flex gap-2">
					<Filters
						formData={formData}
						change={change}
						isLoading={isLoading}
						reset={reset}
						submit={submit}
					/>
					<SearchFilter formData={formData} change={change} isLoading={isLoading} />
				</div>

				{/* View Toggle - Hidden on small screens for table view */}
				<div className="flex items-center justify-end lg:justify-normal gap-2">
					<ViewToggleButton mode="cards" icon={LayoutGrid} label="Cards" />
					<div className="hidden lg:block">
						<ViewToggleButton mode="list" icon={List} label="List" />
					</div>
					<div className="hidden lg:block">
						<ViewToggleButton mode="table" icon={Table} label="Table" />
					</div>
				</div>
			</div>

			{/* Filters Row */}
		</div>
	);
});
