import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import * as React from "react";
import { FilterFormProps } from "./use-events-filter";

export default React.memo(function SearchFilter(props: FilterFormProps) {
	return (
		<div className="relative flex-1 lg:flex-none">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
			<Input
				type="search"
				placeholder="Search by title or tags..."
				value={props.formData.search}
				onChange={(e) => props.change("search", e.target.value)}
				disabled={props.isLoading}
				className="pl-10"
			/>
		</div>
	);
});
