import { z } from "zod";
import { REFUND_POLICY_TYPES } from "@/types/event.types";

export const eventSettingsSchema = z
	.object({
		refund_policy_type: z.enum(REFUND_POLICY_TYPES, {
			required_error: "Refund policy type is required",
		}),
		refund_policy_days: z.number().min(1, "Must be at least 1 day").nullable(),
		automate_refunds: z.boolean(),
		enable_downloads: z.boolean(),
		allow_individual_upload: z.boolean(),
		allow_professional_upload: z.boolean(),
	})
	.refine(
		(data) => {
			// If refund policy is not "no-refund", refund_policy_days must be provided
			if (data.refund_policy_type !== "no-refund" && !data.refund_policy_days) {
				return false;
			}
			return true;
		},
		{
			message: "Refund policy days is required when refund policy is enabled",
			path: ["refund_policy_days"],
		}
	);

export type EventSettingsFormData = z.infer<typeof eventSettingsSchema>;
