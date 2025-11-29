"use client";

import { Input, Textarea, SelectBox, DateInput, TimeInput } from "@/components/app/form-input";
import { DISCOUNT_TYPES } from "@/types/event-ticket.types";
import { PromoFormState } from "./schema";


type Props = {
	formData: PromoFormState;
	errors: Record<string, string>;
	updateForm: <K extends keyof PromoFormState>(field: K, value: PromoFormState[K]) => void;
};

export default function DiscountForm({ formData, errors, updateForm }: Props) {
	const discountTypeOptions = DISCOUNT_TYPES.filter((t) => t !== "none").map((t) => ({
		value: t,
		title: t.split("_").join(" "),
	}));

	return (
		<div className="space-y-8">
			<Input
				label="Promo Name"
				value={formData.name}
				floatingLabel
				placeholder="Enter promo name"
				onChange={(e) => updateForm("name", e.target.value)}
				errorMessage={errors.name}
				required
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<SelectBox
					label="Discount Type"
					floatingLabel
					options={discountTypeOptions}
					value={formData.discount_type}
					onchange={(v) => updateForm("discount_type", v as PromoFormState["discount_type"])}
				/>
				{formData.discount_type === "percentage" ? (
					<Input
						label="Discount Percentage (%)"
						floatingLabel
						type="number"
						value={formData.discount_percentage}
						placeholder="Enter discount percentage"
						onChange={(e) => updateForm("discount_percentage", e.target.value)}
						errorMessage={errors.discount_percentage}
					/>
				) : (
					<Input
						label="Discount Amount"
						floatingLabel
						type="number"
						value={formData.discount_amount}
						placeholder="Enter discount amount"
						onChange={(e) => updateForm("discount_amount", e.target.value)}
						errorMessage={errors.discount_amount}
					/>
				)}
			</div>

			{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Min Purchase Qty"
					floatingLabel
					type="number"
					value={formData.min_purchase_quantity}
					placeholder="Enter min purchase quantity"
					onChange={(e) => updateForm("min_purchase_quantity", e.target.value)}
					errorMessage={errors.min_purchase_quantity}
				/>
				<Input
					label="Max Purchase Qty"
					floatingLabel
					type="number"
					value={formData.max_purchase_quantity}
					placeholder="Enter max purchase quantity"
					onChange={(e) => updateForm("max_purchase_quantity", e.target.value)}
					errorMessage={errors.max_purchase_quantity}
				/>
			</div> */}

			<Textarea
				label="Notes"
				floatingLabel
				note="Leave notes for the promo."
				notePlacement="bottom"
				value={formData.note}
				placeholder="Enter notes"
				onChange={(e) => updateForm("note", e.target.value)}
				rows={3}
				errorMessage={errors.note}
			/>

			{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DateInput
					label="Discount Start Date"
					floatingLabel
					note={
						<AppTooltip
							trigger={
								<span className="flex items-center gap-1">
									when the discount will be valid <InfoIcon className="w-4 h-4" />
								</span>
							}
						>
							<p>
								Set Dates when this discount ticket would be valid, if used outside the set dates
								the ticket will be invalid.{" "}
							</p>
						</AppTooltip>
					}
					value={formData.discount_start_date ? new Date(formData.discount_start_date) : undefined}
					onChange={(d) => updateForm("discount_start_date", d ? d.toISOString() : null)}
					errorMessage={errors.discount_start_date}
				/>
				<DateInput
					label="Discount End Date"
					floatingLabel
					value={formData.discount_end_date ? new Date(formData.discount_end_date) : undefined}
					onChange={(d) => updateForm("discount_end_date", d ? d.toISOString() : null)}
					errorMessage={errors.discount_end_date}
				/>
			</div> */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<DateInput
					label="Sales Start Date"
					floatingLabel
					value={formData.sales_start_date ? new Date(formData.sales_start_date) : undefined}
					onChange={(d) => updateForm("sales_start_date", d?.toISOString() ?? "")}
					errorMessage={errors.sales_start_date}
				/>
				<TimeInput
					label="Sales Start Time"
					floatingLabel
					value={formData.sales_start_time ?? ""}
					onChange={(t) => updateForm("sales_start_time", t || null)}
					modal
					errorMessage={errors.sales_start_time}
				/>
				<DateInput
					label="Sales End Date"
					floatingLabel
					value={formData.sales_end_date ? new Date(formData.sales_end_date) : undefined}
					onChange={(d) => updateForm("sales_end_date", d ? d.toISOString() : null)}
					errorMessage={errors.sales_end_date}
					required={false}
				/>
				<TimeInput
					label="Sales End Time"
					floatingLabel
					modal
					value={formData.sales_end_time ?? ""}
					onChange={(t) => updateForm("sales_end_time", t || null)}
					errorMessage={errors.sales_end_time}
				/>
			</div>
		</div>
	);
}
