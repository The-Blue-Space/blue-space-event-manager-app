import { SelectBox } from "@/components/app/form-input";
import * as React from "react";
import { FilterFormProps } from "./use-orders-filter";
import { PAYMENT_STATUS } from "@/types/order.types";

export default React.memo(function PaymentStatusFilter(props: FilterFormProps) {
	const options = React.useMemo(() => {
		return [
			{ title: "All Status", value: "all" },
			...PAYMENT_STATUS.map((status) => ({
				title: status.charAt(0).toUpperCase() + status.slice(1),
				value: status,
			})),
		];
	}, []);

	const handleChange = (value: string) => {
		if (value === "all") {
			props.change("payment_status", "");
			return;
		}
		props.change("payment_status", value);
	};

	return (
		<SelectBox
			label="Payment Status"
			value={props.formData.payment_status}
			placeholder="Select status"
			options={options}
			onchange={handleChange}
			disabled={props.isLoading}
		/>
	);
});

