"use client";
import * as React from "react";
import { z } from "zod";
import useSavedForm from "@/hooks/use-saved-form";
import { RefundPolicyType } from "@/types/event.types";
import { ManagerProfile } from "@/types/user.types";
import useSaveProfile from "../use-save-profile";

export const MAX_REFUND_DAYS = 365;

const refundDaysSchema = z
	.string()
	.trim()
	.min(1, "Enter how many days before the event guests can ask.")
	.transform(Number)
	.pipe(
		z
			.number()
			.int("Use a whole number of days.")
			.min(1, `Use a number from 1 to ${MAX_REFUND_DAYS}.`)
			.max(MAX_REFUND_DAYS, `Use a number from 1 to ${MAX_REFUND_DAYS}.`)
	);

export type EventDefaultsForm = {
	refund_policy_type: RefundPolicyType;
	refund_policy_days: string;
	automate_refunds: boolean;
	allow_individual_upload: boolean;
	allow_professional_upload: boolean;
	enable_downloads: boolean;
};

const toForm = (profile: ManagerProfile): EventDefaultsForm => ({
	refund_policy_type: profile.refund_policy_type ?? "no-refund",
	refund_policy_days: profile.refund_policy_days?.toString() ?? "",
	automate_refunds: profile.automate_refunds,
	allow_individual_upload: profile.allow_individual_upload,
	allow_professional_upload: profile.allow_professional_upload,
	enable_downloads: profile.enable_downloads,
});

const needsDays = (form: EventDefaultsForm) => form.refund_policy_type !== "no-refund";

/** Guests never see these defaults (only new events start from them), so they save themselves. */
export default function useEventDefaults(profile: ManagerProfile) {
	const { send } = useSaveProfile(profile);
	const server = React.useMemo(() => toForm(profile), [profile]);

	const saving = useSavedForm<EventDefaultsForm>({
		server,
		resetKey: profile.id,
		mode: "auto",
		backup: "settings-event-defaults",
		// A refund policy only makes sense with its window, so the two always save together.
		groups: [["refund_policy_type", "refund_policy_days"]],
		invalid: (values) =>
			needsDays(values) && !refundDaysSchema.safeParse(values.refund_policy_days).success ? ["refund_policy_days"] : [],
		save: async (next) => {
			const { refund_policy_days, ...rest } = next;
			// "No refunds" hides the window, so the saved one is left as it was.
			await send(needsDays(next) ? { ...rest, refund_policy_days: Number(refund_policy_days) } : rest);
		},
		delay: 700,
	});
	const form = saving.values ?? server;

	const days = refundDaysSchema.safeParse(form.refund_policy_days);
	const daysError = saving.showErrors && needsDays(form) && !days.success ? days.error.issues[0].message : undefined;

	const set = <Field extends keyof EventDefaultsForm>(field: Field, value: EventDefaultsForm[Field]) =>
		saving.setValues((prev) => ({ ...prev, [field]: value }));

	/** Enter in the days field saves straight away. */
	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		void saving.flush();
	};

	return { form, daysError, needsDays: needsDays(form), saving, set, submit };
}
