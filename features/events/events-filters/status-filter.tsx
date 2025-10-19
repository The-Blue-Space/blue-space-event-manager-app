import { SelectBox } from "@/components/app/form-input";
import * as React from "react";
import { FilterFormProps } from "./use-events-filter";

export default React.memo(function StatusFilter(props: FilterFormProps) {
	const options = [
		{ title: "All Status", value: "all" },
		{ title: "Published", value: "true" },
		{ title: "Unpublished", value: "false" },
	];

	const handleChange = (value: string) => {
		if (value === "all") {
			props.change("published", "");
			return;
		}
		props.change("published", value);
	};

	return (
		<SelectBox
			label="Status"
			value={props.formData.published}
			placeholder="Select status"
			options={options}
			onchange={handleChange}
			disabled={props.isLoading}
		/>
	);
});
