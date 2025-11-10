import { SelectBox } from "@/components/app/form-input";
import * as React from "react";
import { FilterFormProps } from "./use-orders-filter";

export default React.memo(function EventFilter(props: FilterFormProps) {
	const options = React.useMemo(() => {
		if (!props.events || props.events.length === 0) {
			return [{ title: "All Events", value: "all" }];
		}
		return [
			{ title: "All Events", value: "all" },
			// merge duplicates
			...props.events
				.filter((event, index, self) => index === self.findIndex((t) => t.id === event.id))
				.map((event) => ({
					title: event.title,
					value: event.id,
				})),
		];
	}, [props.events]);

	const handleChange = (value: string) => {
		if (value === "all") {
			props.change("event_id", "");
			return;
		}
		props.change("event_id", value);
	};

	return (
		<SelectBox
			label="Event"
			value={props.formData.event_id}
			placeholder="Select event"
			options={options}
			onchange={handleChange}
			disabled={props.isLoading}
			showSearch
		/>
	);
});
