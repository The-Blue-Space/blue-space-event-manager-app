"use client";

import { Input } from "@/components/app/form-input";
import { cn } from "@/lib/utils";
import { PromoFormState } from "./schema";

type Props = {
	formData: PromoFormState;
	errors: Record<string, string>;
	updateForm: <K extends keyof PromoFormState>(field: K, value: PromoFormState[K]) => void;
};

export default function DiscountForm({ formData, errors, updateForm }: Props) {
	return (
		<div className="space-y-4">
			{/* Discount type pill toggle */}
			<div className="flex rounded-lg border border-neutral-200 overflow-hidden">
				<button
					type="button"
					onClick={() => updateForm("discount_type", "percentage")}
					className={cn(
						"flex-1 py-2.5 body-3 font-medium transition-colors",
						formData.discount_type === "percentage"
							? "bg-primary-500 text-white"
							: "bg-white text-neutral-600 hover:bg-neutral-50"
					)}
				>
					% Percentage
				</button>
				<button
					type="button"
					onClick={() => updateForm("discount_type", "fixed")}
					className={cn(
						"flex-1 py-2.5 body-3 font-medium transition-colors border-l border-neutral-200",
						formData.discount_type === "fixed"
							? "bg-primary-500 text-white"
							: "bg-white text-neutral-600 hover:bg-neutral-50"
					)}
				>
					Fixed Amount
				</button>
			</div>

			{/* Value input */}
			{formData.discount_type === "percentage" ? (
				<Input
					label="Discount Percentage"
					floatingLabel
					type="number"
					value={formData.discount_percentage}
					placeholder="e.g. 20"
					onChange={(e) => updateForm("discount_percentage", e.target.value)}
					errorMessage={errors.discount_percentage}
					required
					note="Enter a value between 1 and 100"
				/>
			) : (
				<Input
					label="Discount Amount"
					floatingLabel
					type="number"
					value={formData.discount_amount}
					placeholder="e.g. 500"
					onChange={(e) => updateForm("discount_amount", e.target.value)}
					errorMessage={errors.discount_amount}
					required
				/>
			)}
		</div>
	);
}
