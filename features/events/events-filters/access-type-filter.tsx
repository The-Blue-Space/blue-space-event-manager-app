import { SelectBox } from "@/components/app/form-input";
import * as React from "react";
import { FilterFormProps } from "./use-events-filter";

export default React.memo(function AccessTypeFilter(props: FilterFormProps) {
	const options = [
		{ title: "All Types", value: "all" },
		{ title: "Ticket-based", value: "ticket-based" },
		{ title: "Individual", value: "individual" },
		{ title: "General", value: "general" },
		{ title: "None", value: "none" },
	];
	const handleChange = (value: string) => {
		if (value === "all") {
			props.change("access_type", "");
			return;
		}
		props.change("access_type", value);
	};

	return (
		<SelectBox
			className="w-full"
			label="Access Type"
			value={props.formData.access_type}
			placeholder="Select access type"
			options={options}
			onchange={handleChange}
			disabled={props.isLoading}
		/>
	);
});
