"use client";

import { Input, Textarea, DateInput, TimeInput } from "@/components/app/form-input";
import { PromoFormState } from "./schema";

type Props = {
	formData: PromoFormState;
	errors: Record<string, string>;
	updateForm: <K extends keyof PromoFormState>(field: K, value: PromoFormState[K]) => void;
};

export default function FreebieForm({ formData, errors, updateForm }: Props) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Promo Name"
					value={formData.name}
					placeholder="Enter promo name"
					onChange={(e) => updateForm("name", e.target.value)}
					floatingLabel
					errorMessage={errors.name}
					required
				/>
				<Input
					label="Free Ticket Quantity"
					type="number"
					value={formData.free_ticket_quantity}
					placeholder="Enter free ticket quantity"
					onChange={(e) => updateForm("free_ticket_quantity", e.target.value)}
					errorMessage={errors.free_ticket_quantity}
					floatingLabel
					required
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Min Purchase Qty"
					type="number"
					value={formData.min_purchase_quantity}
					placeholder="Enter min purchase quantity"
					onChange={(e) => updateForm("min_purchase_quantity", e.target.value)}
					errorMessage={errors.min_purchase_quantity}
					floatingLabel
					note="Minimum number of tickets to qualify for a freebie"
				/>
				<Input
					label="Max Purchase Qty"
					type="number"
					value={formData.max_purchase_quantity}
					placeholder="Enter max purchase quantity"
					onChange={(e) => updateForm("max_purchase_quantity", e.target.value)}
					errorMessage={errors.max_purchase_quantity}
					floatingLabel
					note="Maximum number of tickets eligible for a freebie"
				/>
			</div>

			<Textarea
				label="Note"
				note="Leave notes for the promo."
				notePlacement="bottom"
				value={formData.note}
				placeholder="Enter notes"
				onChange={(e) => updateForm("note", e.target.value)}
				rows={3}
				errorMessage={errors.note}
				floatingLabel
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DateInput
					label="Sales Start Date"
					value={formData.sales_start_date ? new Date(formData.sales_start_date) : undefined}
					onChange={(d) => updateForm("sales_start_date", d?.toISOString() ?? "")}
					errorMessage={errors.sales_start_date}
					floatingLabel
				/>
				<TimeInput
					label="Sales Start Time"
					value={formData.sales_start_time ?? ""}
					onChange={(t) => updateForm("sales_start_time", t || null)}
					errorMessage={errors.sales_start_time}
					floatingLabel
				/>
				<DateInput
					label="Sales End Date"
					value={formData.sales_end_date ? new Date(formData.sales_end_date) : undefined}
					onChange={(d) => updateForm("sales_end_date", d ? d.toISOString() : null)}
					errorMessage={errors.sales_end_date}
					floatingLabel
				/>
				<TimeInput
					label="Sales End Time"
					value={formData.sales_end_time ?? ""}
					onChange={(t) => updateForm("sales_end_time", t || null)}
					errorMessage={errors.sales_end_time}
					floatingLabel
				/>
			</div>
		</div>
	);
}
