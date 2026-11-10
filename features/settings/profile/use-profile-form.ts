"use client";
import * as React from "react";
import { setUpProfileSchema, SetUpProfileForm } from "@/features/home/set-up-profile/schema";
import { FieldErrors, firstErrors, pickImage, PickedImage } from "@/features/home/set-up-profile/use-set-up-profile";
import { ManagerProfile } from "@/types/user.types";
import useSaveProfile from "../use-save-profile";

type Saved = { form: SetUpProfileForm; logoUrl: string | null; coverUrl: string | null };

const toForm = (profile: ManagerProfile): SetUpProfileForm => ({
	name: profile.name,
	bio: profile.bio ?? "",
	email: profile.email ?? "",
	phone: profile.phone ?? "",
	operating_country_id: profile.operating_country_id ?? "",
});

const FIELDS = Object.keys(setUpProfileSchema.shape) as (keyof SetUpProfileForm)[];

export default function useProfileForm(profile: ManagerProfile) {
	const { save, isSaving } = useSaveProfile(profile);
	const [saved, setSaved] = React.useState<Saved>(() => ({
		form: toForm(profile),
		logoUrl: profile.logo,
		coverUrl: profile.display_image,
	}));
	const [form, setForm] = React.useState(saved.form);
	const [logo, setLogo] = React.useState<PickedImage | null>(null);
	const [cover, setCover] = React.useState<PickedImage | null>(null);
	const [attempted, setAttempted] = React.useState(false);

	const errors = React.useMemo<FieldErrors>(() => {
		if (!attempted) return {};
		const result = setUpProfileSchema.safeParse(form);
		return result.success ? {} : firstErrors(result.error);
	}, [attempted, form]);

	const dirty = Boolean(logo || cover) || FIELDS.some((field) => form[field] !== saved.form[field]);

	const setValue = (field: keyof SetUpProfileForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
	const update = (field: keyof SetUpProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setValue(field, e.target.value);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAttempted(true);
		const result = setUpProfileSchema.safeParse(form);
		if (!result.success) return;

		const { bio, ...values } = result.data;
		const updated = await save(
			{ ...values, bio: bio || null, logo: logo?.file ?? null, display_image: cover?.file ?? null },
			"Profile saved"
		);
		if (!updated) return;

		// New images upload after the server responds, so keep showing them instead of the old URLs.
		const next = {
			form: toForm(updated),
			logoUrl: logo?.preview ?? updated.logo,
			coverUrl: cover?.preview ?? updated.display_image,
		};
		setSaved(next);
		setForm(next.form);
		setLogo(null);
		setCover(null);
		setAttempted(false);
	};

	return {
		form,
		errors,
		logo,
		cover,
		logoUrl: saved.logoUrl,
		coverUrl: saved.coverUrl,
		dirty,
		isSaving,
		update,
		setValue,
		pickLogo: pickImage(setLogo),
		pickCover: pickImage(setCover),
		removeLogo: () => setLogo(null),
		removeCover: () => setCover(null),
		submit,
	};
}
