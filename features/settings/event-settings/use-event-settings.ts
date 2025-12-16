import React from "react";
import { ZodError } from "zod";
import { toast } from "sonner";
import { eventSettingsSchema, EventSettingsFormData } from "./schema";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import updateManagerProfile from "@/services/account/update-manager-profile";
import invalidateQuery from "@/lib/invalidate-query";
import useAppSelector from "@/store/hooks";

export default function useEventSettings() {
	const {managerProfile} = useAppSelector("manager_profile");
	const [isLoading, setIsLoading] = React.useState(false);
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	const initialFormData: EventSettingsFormData = React.useMemo(
		() => ({
			refund_policy_type: managerProfile?.refund_policy_type ?? "no-refund",
			refund_policy_days: managerProfile?.refund_policy_days ?? null,
			automate_refunds: managerProfile?.automate_refunds ?? false,
			enable_downloads: managerProfile?.enable_downloads ?? false,
			allow_individual_upload: managerProfile?.allow_individual_upload ?? false,
			allow_professional_upload: managerProfile?.allow_professional_upload ?? false,
		}),
		[managerProfile]
	);

	const [formData, setFormData] = React.useState<EventSettingsFormData>(initialFormData);

	React.useEffect(() => {
		if (managerProfile) {
			setFormData({
				refund_policy_type: managerProfile.refund_policy_type ?? "no-refund",
				refund_policy_days: managerProfile.refund_policy_days ?? null,
				automate_refunds: managerProfile.automate_refunds ?? false,
				enable_downloads: managerProfile.enable_downloads ?? false,
				allow_individual_upload: managerProfile.allow_individual_upload ?? false,
				allow_professional_upload: managerProfile.allow_professional_upload ?? false,
			});
		}
	}, [managerProfile]);

	const updateForm = (field: keyof EventSettingsFormData, value: any) => {
		setFormData((prev) => {
			const updated = { ...prev, [field]: value };

			// Clear refund_policy_days when changing to no-refund
			if (field === "refund_policy_type" && value === "no-refund") {
				updated.refund_policy_days = null;
			}

			return updated;
		});
		setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const submit = async () => {
		if (!managerProfile?.id) {
			toast.error("Manager profile not found");
			return;
		}

		setErrors({});
		setIsLoading(true);

		try {
			const validated = eventSettingsSchema.parse(formData);

			const payload = {
				refund_policy_type: validated.refund_policy_type,
				refund_policy_days:
					validated.refund_policy_type !== "no-refund" ? validated.refund_policy_days : null,
				automate_refunds: validated.automate_refunds,
				enable_downloads: validated.enable_downloads,
				allow_individual_upload: validated.allow_individual_upload,
				allow_professional_upload: validated.allow_professional_upload,
			};

			await updateManagerProfile({
				id: managerProfile.id,
				payload,
			});

			toast.success("Event settings updated successfully");
			invalidateQuery(["manager-profile"]);
		} catch (err) {
			if (err instanceof ZodError) {
				const formattedErrors = formatZodErrors(err);
				setErrors(formattedErrors);
				toast.error("Please fix the form errors");
			} else {
				const errMsg = ensureError(err).message;
				toast.error(errMsg);
			}
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
	};
}
