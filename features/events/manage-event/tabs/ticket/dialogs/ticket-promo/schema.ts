import { z } from "zod";

export const promoBaseSchema = z.object({
	name: z.string().min(2, "Name is required"),
	description: z.string().optional(),
	note: z.string().optional(),
	min_purchase_quantity: z.number().int().min(1).optional(),
	max_purchase_quantity: z.number().int().min(1).optional(),
	sales_start_date: z.string(),
	sales_start_time: z.string().optional(),
	sales_end_date: z.string().nullable().optional(),
	sales_end_time: z.string().nullable().optional(),
});

export const discountSchema = promoBaseSchema
	.extend({
		promo_type: z.literal("discount"),
		discount_type: z.enum(["percentage", "fixed"]),
		discount_percentage: z.number().min(1).max(100).optional(),
		discount_amount: z.number().min(1).optional(),
	})
	.refine(
		(val) => {
			if (val.discount_type === "percentage") return !!val.discount_percentage;
			if (val.discount_type === "fixed") return !!val.discount_amount;
			return false;
		},
		{ message: "Provide percentage or amount for discount" }
	);

export const freebieSchema = promoBaseSchema.extend({
	promo_type: z.literal("free_ticket"),
	free_ticket_quantity: z.number().int().min(1, "At least 1 free ticket"),
});

export type DiscountForm = z.infer<typeof discountSchema>;
export type FreebieForm = z.infer<typeof freebieSchema>;
