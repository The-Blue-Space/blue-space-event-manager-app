import { DISCOUNT_TYPES, DiscountType, PromoType } from "@/types/event-ticket.types";
import { z } from "zod";

export const promoBaseSchema = z.object({
	name: z.string().min(2, "Name is required"),
	description: z.string().optional(),
	note: z.string().optional(),
	min_purchase_quantity: z.number().int().min(1).optional().nullable(),
	max_purchase_quantity: z.number().int().min(1).optional().nullable(),
	sales_start_date: z.string().min(1, "Sales start date is required"),
	sales_start_time: z.string().nullable().optional(),
	sales_end_date: z.string().nullable().optional(),
	sales_end_time: z.string().nullable().optional(),
});

export const discountSchema = promoBaseSchema
	.extend({
		promo_type: z.literal("discount"),
		discount_type: z.enum(["percentage", "fixed"]),
		discount_percentage: z.number().min(1).max(100).nullable().optional(),
		discount_amount: z.number().min(1).nullable().optional(),
		discount_start_date: z.string().nullable().optional(),
		discount_end_date: z.string().nullable().optional(),
	})
	.refine(
		(val) => {
			if (val.discount_type === "percentage") return !!val.discount_percentage;
			if (val.discount_type === "fixed") return !!val.discount_amount;
			return false;
		},
		{ message: "Provide percentage or amount for discount", path: ["discount_percentage"] }
	);

export const freebieSchema = promoBaseSchema.extend({
	promo_type: z.literal("free_ticket"),
	free_ticket_quantity: z.number().int().min(1, "At least 1 free ticket"),
});

export type DiscountForm = z.infer<typeof discountSchema>;
export type FreebieForm = z.infer<typeof freebieSchema>;

export type PromoFormState = {
	promo_type: PromoType;
	name: string;
	description: string;
	note: string;
	discount_type: DiscountType;
	discount_percentage: string;
	discount_amount: string;
	free_ticket_quantity: string;
	min_purchase_quantity: string;
	max_purchase_quantity: string;
	discount_start_date: string | null;
	discount_end_date: string | null;
	sales_start_date: string;
	sales_start_time: string | null;
	sales_end_date: string | null;
	sales_end_time: string | null;
	is_active: boolean;
};

export const promoFormInitial: PromoFormState = {
	promo_type: "discount",
	name: "",
	description: "",
	note: "",
	discount_type: DISCOUNT_TYPES[0],
	discount_percentage: "",
	discount_amount: "",
	free_ticket_quantity: "",
	min_purchase_quantity: "1",
	max_purchase_quantity: "",
	discount_start_date: null,
	discount_end_date: null,
	sales_start_date: "",
	sales_start_time: null,
	sales_end_date: null,
	sales_end_time: null,
	is_active: true,
};
