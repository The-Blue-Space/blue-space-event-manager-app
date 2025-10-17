import { SelectBox } from "@/components/app/form-input";
import * as React from "react";
import { FilterFormProps } from "./use-table-filter";

export default React.memo(function StatusFilter(props: FilterFormProps) {
	const options = ["all", "pending", "approved", "rejected"].map((status) => ({
		title: status.split("_").join(" "),
		value: status,
	}));

	const change = (value: string) => {
		if (value === "all") {
			return props.change("status", "");
		}
		props.change("status", value);
	};
	return (
		<SelectBox
			label="Status"
			value={props.formData.status}
			placeholder="select status"
			options={options}
			onchange={change}
			disabled={props.isLoading}
		/>
	);
});
