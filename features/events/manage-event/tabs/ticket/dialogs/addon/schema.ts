import { EVENT_TICKET_TYPES } from "@/types/event-ticket.types";
import { z } from "zod";

export const addonSchema = z
	.object({
		name: z.string().trim().min(2, "Addon name is required"),
		description: z.string().trim().optional(),
		type: z.enum(EVENT_TICKET_TYPES, { message: "Addon type is required" }),
		price: z.number().min(0, "Price must be 0 or greater").nullable(),
		currency_id: z.string().trim().nullable(),
		ticket_ids: z.array(z.string()).nullable(),
		sales_start_date: z.string().trim().min(1, "Sales start date is required"),
		sales_start_time: z.string().trim().nullable(),
		sales_end_date: z.string().trim().nullable(),
		sales_end_time: z.string().trim().nullable(),
		expires_at: z.string().trim().nullable(),
		is_active: z.boolean().default(true),
	})
	.refine(
		(data) => {
			// If type is paid, price and currency_id should be provided
			if (data.type === "paid") {
				return (
					data.price !== null &&
					data.price !== undefined &&
					data.price > 0 &&
					data.currency_id !== null &&
					data.currency_id !== ""
				);
			}
			// If type is donation, currency_id should be provided (price can be null as it's variable)
			if (data.type === "donation") {
				return data.currency_id !== null && data.currency_id !== "";
			}
			// If type is free, price should be null and currency_id can be null
			return true;
		},
		{
			message: "Price and currency are required for paid addons",
			path: ["price"],
		}
	)
	.refine(
		(data) => {
			// Sales end date must be after start date if both are provided
			if (data.sales_end_date && data.sales_start_date) {
				const startDate = new Date(data.sales_start_date);
				const endDate = new Date(data.sales_end_date);
				return endDate >= startDate;
			}
			return true;
		},
		{
			message: "Sales end date must be after start date",
			path: ["sales_end_date"],
		}
	);

export type AddonFormData = z.infer<typeof addonSchema>;

export const addonInitial: AddonFormData = {
	name: "",
	description: "",
	type: "paid",
	price: null,
	currency_id: null,
	ticket_ids: null,
	sales_start_date: "",
	sales_start_time: null,
	sales_end_date: null,
	sales_end_time: null,
	expires_at: null,
	is_active: true,
};
