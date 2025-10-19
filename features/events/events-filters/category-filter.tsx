import { SelectBox } from "@/components/app/form-input";
import * as React from "react";
import { FilterFormProps } from "./use-events-filter";

export default React.memo(function CategoryFilter(props: FilterFormProps) {
	// TODO: Fetch categories from API
	// For now, using placeholder options
	const options = [
		{ title: "All Categories", value: "all" },
		{ title: "Music", value: "cat_music" },
		{ title: "Art", value: "cat_art" },
		{ title: "Sports", value: "cat_sports" },
		{ title: "Fashion", value: "cat_fashion" },
		{ title: "Technology", value: "cat_tech" },
	];

	const handleChange = (value: string) => {
		if (value === "all") {
			props.change("category", "");
			return;
		}
		props.change("category", value);
	};

	return (
		<SelectBox
			label="Category"
			value={props.formData.category}
			placeholder="Select category"
			options={options}
			onchange={handleChange}
			disabled={props.isLoading}
		/>
	);
});
