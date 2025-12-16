import { z } from "zod";

export const disputeSchema = z.object({
	dispute_reason: z
		.string()
		.min(10, "Dispute reason must be at least 10 characters")
		.max(500, "Dispute reason must not exceed 500 characters"),
});

export type DisputeFormData = z.infer<typeof disputeSchema>;

export const disputeInitial: DisputeFormData = {
	dispute_reason: "",
};
