"use client";

import { Input, Textarea, SelectBox, DateInput, TimeInput } from "@/components/app/form-input";
import { DISCOUNT_TYPES } from "@/types/event-ticket.types";
import React from "react";

type Props = {
	initialValues: any | null;
};

export default function DiscountForm({ initialValues }: Props) {
	const [form, setForm] = React.useState<any>({
		name: initialValues?.name || "",
		description: initialValues?.description || "",
		note: initialValues?.note || "",
		discount_type: initialValues?.discount_type || "percentage",
		discount_percentage: initialValues?.discount_percentage || "",
		discount_amount: initialValues?.discount_amount || "",
		min_purchase_quantity: initialValues?.min_purchase_quantity || "",
		max_purchase_quantity: initialValues?.max_purchase_quantity || "",
		sales_start_date: initialValues?.sales_start_date
			? new Date(initialValues.sales_start_date)
			: undefined,
		sales_start_time: initialValues?.sales_start_time || "",
		sales_end_date: initialValues?.sales_end_date
			? new Date(initialValues.sales_end_date)
			: undefined,
		sales_end_time: initialValues?.sales_end_time || "",
	});

	const onChange = (key: string, value: any) => setForm((p: any) => ({ ...p, [key]: value }));

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Promo Name"
					value={form.name}
					placeholder="Enter promo name"
					onChange={(e) => onChange("name", e.target.value)}
					required
				/>
				<SelectBox
					label="Discount Type"
					options={DISCOUNT_TYPES.map((t) => ({ value: t, title: t.split("_").join(" ") }))}
					value={form.discount_type}
					onchange={(v) => onChange("discount_type", v)}
				/>
			</div>
			{form.discount_type === "percentage" ? (
				<Input
					label="Discount Percentage (%)"
					type="number"
					value={form.discount_percentage}
					placeholder="Enter discount percentage"
					onChange={(e) => onChange("discount_percentage", e.target.value)}
				/>
			) : (
				<Input
					label="Discount Amount"
					type="number"
					value={form.discount_amount}
					placeholder="Enter discount amount"
					onChange={(e) => onChange("discount_amount", e.target.value)}
				/>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Min Purchase Qty"
					type="number"
					value={form.min_purchase_quantity}
					placeholder="Enter min purchase quantity"
					onChange={(e) => onChange("min_purchase_quantity", e.target.value)}
				/>
				<Input
					label="Max Purchase Qty"
					type="number"
					value={form.max_purchase_quantity}
					placeholder="Enter max purchase quantity"
					onChange={(e) => onChange("max_purchase_quantity", e.target.value)}
				/>
			</div>
			{/* <Textarea
				label="Description"
				value={form.description}
				placeholder="Enter description"
				onChange={(e) => onChange("description", e.target.value)}
				rows={3}
			/> */}
			<Textarea
				label="Notes"
				note="Leave notes for the promo."
				notePlacement="bottom"
				value={form.note}
				placeholder="Enter notes"
				onChange={(e) => onChange("note", e.target.value)}
				rows={3}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DateInput
					label="Sales Start Date"
					value={form.sales_start_date}
					onChange={(d) => onChange("sales_start_date", d)}
				/>
				<TimeInput
					label="Sales Start Time"
					value={form.sales_start_time}
					onChange={(t) => onChange("sales_start_time", t)}
				/>
				<DateInput
					label="Sales End Date"
					value={form.sales_end_date}
					onChange={(d) => onChange("sales_end_date", d)}
				/>
				<TimeInput
					label="Sales End Time"
					value={form.sales_end_time}
					onChange={(t) => onChange("sales_end_time", t)}
				/>
			</div>
		</div>
	);
}
