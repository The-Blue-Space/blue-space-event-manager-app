import { REFUND_POLICY_TYPES } from "@/types/event.types";
import { z } from "zod";

export const publishEventSchema = z
	.object({
		is_private: z.boolean(),
		allow_individual_upload: z.boolean(),
		allow_professional_upload: z.boolean(),
		refund_policy_type: z.enum(REFUND_POLICY_TYPES),
		refund_policy_days: z.number().min(1).max(30).nullable(),
		automate_refunds: z.boolean(),
		should_schedule: z.boolean(),
		scheduled_date: z.string().nullable(),
		scheduled_time: z.string().nullable(),
	})
	.refine(
		(data) => {
			// If refund policy allows refunds, days must be provided
			if (data.refund_policy_type !== "no-refund" && !data.refund_policy_days) {
				return false;
			}
			return true;
		},
		{
			message: "Days before event is required when refunds are allowed",
			path: ["refund_policy_days"],
		}
	)
	.refine(
		(data) => {
			// If scheduling, date and time must be provided and in the future
			if (data.should_schedule) {
				if (!data.scheduled_date || !data.scheduled_time) {
					return false;
				}
				try {
					const scheduledDateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}`);
					const now = new Date();
					return scheduledDateTime > now;
				} catch {
					return false;
				}
			}
			return true;
		},
		{
			message: "Scheduled date and time must be in the future",
			path: ["scheduled_date"],
		}
	);

export type PublishEventFormData = z.infer<typeof publishEventSchema>;
