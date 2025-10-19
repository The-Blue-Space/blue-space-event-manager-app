import { SelectBox } from "@/components/app/form-input";
import * as React from "react";
import { FilterFormProps } from "./use-events-filter";

export default React.memo(function SortFilter(props: FilterFormProps) {
	const options = [
		{ title: "Newest First", value: "newest" },
		{ title: "Uploads", value: "uploads" },
		{ title: "Attendees", value: "attendees" },
		{ title: "Revenue", value: "revenue" },
		{ title: "Date Added", value: "date" },
	];

	const handleChange = (value: string) => {
		props.change("sort_by", value);
		// Default to desc for all sorts
		props.change("sort_order", "desc");
	};

	return (
		<SelectBox
			label="Sort By"
			value={props.formData.sort_by}
			placeholder="Sort by"
			options={options}
			onchange={handleChange}
			disabled={props.isLoading}
		/>
	);
});
