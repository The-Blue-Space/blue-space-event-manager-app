"use client";

import { Input } from "@/components/app/form-input";
import { PromoFormState } from "./schema";

type Props = {
	formData: PromoFormState;
	errors: Record<string, string>;
	updateForm: <K extends keyof PromoFormState>(field: K, value: PromoFormState[K]) => void;
};

export default function FreebieForm({ formData, errors, updateForm }: Props) {
	return (
		<Input
			label="Free Ticket Quantity"
			floatingLabel
			type="number"
			value={formData.free_ticket_quantity}
			placeholder="e.g. 2"
			onChange={(e) => updateForm("free_ticket_quantity", e.target.value)}
			errorMessage={errors.free_ticket_quantity}
			required
			note="Number of free tickets given when the promo condition is met"
		/>
	);
}
