import { useEvent } from "../../context";
import React from "react";
import { publishEventSchema, PublishEventFormData } from "./schema";
import { ZodError } from "zod";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import { toast } from "sonner";
import publishEvent from "@/services/events/publish-event";
import invalidateQuery from "@/lib/invalidate-query";

export default function usePublish() {
	const { event, updateEvent } = useEvent();
	const [isLoading, setIsLoading] = React.useState(false);
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	const initialFormData: PublishEventFormData = React.useMemo(
		() => ({
			is_private: event?.is_private ?? false,
			allow_individual_upload: event?.allow_individual_upload ?? false,
			allow_professional_upload: event?.allow_professional_upload ?? false,
			refund_policy_type: event?.refund_policy_type ?? "no-refund",
			refund_policy_days: event?.refund_policy_days ?? null,
			automate_refunds: event?.automate_refunds ?? false,
			should_schedule: false,
			scheduled_date: null,
			scheduled_time: null,
		}),
		[event]
	);

	const [formData, setFormData] = React.useState<PublishEventFormData>(initialFormData);

	React.useEffect(() => {
		setFormData({
			is_private: event?.is_private ?? false,
			allow_individual_upload: event?.allow_individual_upload ?? false,
			allow_professional_upload: event?.allow_professional_upload ?? false,
			refund_policy_type: event?.refund_policy_type ?? "no-refund",
			refund_policy_days: event?.refund_policy_days ?? null,
			automate_refunds: event?.automate_refunds ?? false,
			should_schedule: false,
			scheduled_date: null,
			scheduled_time: null,
		});
	}, [event]);

	const updateForm = (field: keyof PublishEventFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const validateRequiredFields = (): { isValid: boolean; missingFields: string[] } => {
		const missingFields: string[] = [];

		if (!event?.title || event.title.trim().length < 10) {
			missingFields.push("Title");
		}
		if (!event?.description || event.description.trim().length < 5) {
			missingFields.push("Description");
		}
		if (!event?.event_start_date || !event?.event_start_time) {
			missingFields.push("Event start date and time");
		}
		if (!event?.address || !event?.city) {
			missingFields.push("Location");
		}

		return {
			isValid: missingFields.length === 0,
			missingFields,
		};
	};

	const submit = async () => {
		setErrors({});
		setIsLoading(true);

		try {
			const validated = publishEventSchema.parse(formData);

			// Combine scheduled date and time into ISO string if scheduling
			let published_at: string | null = null;
			if (validated.should_schedule && validated.scheduled_date && validated.scheduled_time) {
				// scheduled_date should be YYYY-MM-DD format, scheduled_time should be HH:MM format
				const [hours, minutes] = validated.scheduled_time.split(":");
				const scheduledDateTime = new Date(validated.scheduled_date);
				scheduledDateTime.setHours(Number(hours), Number(minutes), 0, 0);
				published_at = scheduledDateTime.toISOString();
			}

			// Use validated refund policy type
			const refund_policy_type = validated.refund_policy_type;

			const payload = {
				event_id: event!.id,
				is_private: validated.is_private,
				allow_individual_upload: validated.allow_individual_upload,
				allow_professional_upload: validated.allow_professional_upload,
				refund_policy_type,
				refund_policy_days:
					validated.refund_policy_type !== "no-refund" ? validated.refund_policy_days : null,
				automate_refunds: validated.automate_refunds,
				published_at,
			};

			await publishEvent(payload);

			// Update local event state
			await updateEvent("server", {
				is_private: validated.is_private,
				allow_individual_upload: validated.allow_individual_upload,
				allow_professional_upload: validated.allow_professional_upload,
				refund_policy_type,
				refund_policy_days: payload.refund_policy_days,
				automate_refunds: validated.automate_refunds,
				published: true,
				published_at,
			});

			toast.success(
				validated.should_schedule ? "Event scheduled successfully" : "Event published successfully"
			);
			invalidateQuery(["event-details", event!.id]);
			invalidateQuery(["events"]);
		} catch (err) {
			if (err instanceof ZodError) {
				const formattedErrors = formatZodErrors(err);
				setErrors(formattedErrors);
				toast.error("Please fix the form errors");
			} else {
				const errMsg = ensureError(err).message;
				toast.error(errMsg);
			}
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		formData,
		errors,
		isLoading,
		updateForm,
		submit,
		validateRequiredFields,
	};
}
