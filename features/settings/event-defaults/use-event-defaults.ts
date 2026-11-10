"use client";
import * as React from "react";
import { z } from "zod";
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

export default function useEventDefaults(profile: ManagerProfile) {
	const { save, isSaving } = useSaveProfile(profile);
	const [saved, setSaved] = React.useState(() => toForm(profile));
	const [form, setForm] = React.useState(saved);
	const [attempted, setAttempted] = React.useState(false);

	const needsDays = form.refund_policy_type !== "no-refund";
	const days = refundDaysSchema.safeParse(form.refund_policy_days);
	const daysError = attempted && needsDays && !days.success ? days.error.issues[0].message : undefined;

	// The refund window is hidden for "No refunds", so it only counts as a change while it's shown.
	const dirty = (Object.keys(form) as (keyof EventDefaultsForm)[]).some(
		(field) => form[field] !== saved[field] && (field !== "refund_policy_days" || needsDays)
	);

	const set = <Field extends keyof EventDefaultsForm>(field: Field, value: EventDefaultsForm[Field]) =>
		setForm((prev) => ({ ...prev, [field]: value }));

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAttempted(true);
		if (needsDays && !days.success) return;

		const refund_policy_days = needsDays ? days.data : profile.refund_policy_days;
		const updated = await save({ ...form, refund_policy_days }, "Event defaults saved");
		if (!updated) return;

		setSaved(toForm(updated));
		setForm(toForm(updated));
		setAttempted(false);
	};

	return { form, daysError, needsDays, dirty, isSaving, set, submit };
}
