import { EVENT_TICKET_TYPES } from "@/types/event-ticket.types";
import { z } from "zod";

export const editTicketSchema = z.object({
	name: z.string().trim().min(3, "Ticket name is required"),
	description: z
		.string()
		.trim()
		.min(5, "Ticket description is required, at least 5 characters")
		.max(150, "Ticket description must be less than 50 characters"),
	price: z.number().min(0, "Ticket price is required").nullable(),
	currency_id: z.string().trim().min(1, "Currency is required"),
	minimum_quantity: z.number().positive("Minimum quantity is required, must be greater than 0"),
	maximum_quantity: z
		.number()
		.positive("Maximum quantity is required, must be greater than 0")
		.nullable(),
	total_quantity: z
		.number()
		.positive("Total quantity is required, must be greater than 0")
		.nullable(),
	perks: z.string().trim().min(1, "At least one perk is required"),
	sales_start_date: z.string().trim().min(1, "Sales start is required"),
	sales_start_time: z.string().trim().nullable(),
	sales_end_date: z.string().trim().nullable(),
	sales_end_time: z.string().trim().nullable(),
	expires_at: z.string().trim().nullable(),
	type: z.enum(EVENT_TICKET_TYPES, { message: "Ticket type is required" }),
	absolve_fee: z.boolean().default(false),
	unlimited_quantity: z.boolean().default(false),
});

export type EditTicketFormData = z.infer<typeof editTicketSchema>;

export const editTicketInitial: EditTicketFormData = {
	type: "paid",
	name: "",
	description: "",
	price: null,
	currency_id: "",
	minimum_quantity: 1,
	maximum_quantity: null,
	total_quantity: 50,
	perks: "",
	sales_start_date: "",
	sales_start_time: null,
	sales_end_date: null,
	sales_end_time: null,
	expires_at: null,
	absolve_fee: true,
	unlimited_quantity: false,
};
