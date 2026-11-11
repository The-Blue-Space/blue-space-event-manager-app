"use client";
import * as React from "react";
import { toast } from "sonner";
import { setUpProfileSchema, SetUpProfileForm } from "@/features/home/set-up-profile/schema";
import { FieldErrors, firstErrors, pickImage, PickedImage } from "@/features/home/set-up-profile/use-set-up-profile";
import useSavedForm from "@/hooks/use-saved-form";
import ensureError from "@/lib/ensure-error";
import { ManagerProfile } from "@/types/user.types";
import useSaveProfile from "../use-save-profile";

const toForm = (profile: ManagerProfile): SetUpProfileForm => ({
	name: profile.name,
	bio: profile.bio ?? "",
	email: profile.email ?? "",
	phone: profile.phone ?? "",
	operating_country_id: profile.operating_country_id ?? "",
});

const invalidFields = (form: SetUpProfileForm) => {
	const result = setUpProfileSchema.safeParse(form);
	return result.success ? [] : (Object.keys(firstErrors(result.error)) as (keyof SetUpProfileForm)[]);
};

/** The organizer profile is public, so it saves when you press Save; unsaved edits are kept on the device. */
export default function useProfileForm(profile: ManagerProfile) {
	const { send } = useSaveProfile(profile);
	const server = React.useMemo(() => toForm(profile), [profile]);
	const [logo, setLogo] = React.useState<PickedImage | null>(null);
	const [cover, setCover] = React.useState<PickedImage | null>(null);
	// New images upload after the server responds, so keep showing the picked ones instead of the old URLs.
	const [shown, setShown] = React.useState({ logoUrl: profile.logo, coverUrl: profile.display_image });

	const saving = useSavedForm<SetUpProfileForm>({
		server,
		resetKey: profile.id,
		mode: "manual",
		backup: "settings-profile",
		invalid: invalidFields,
		unsavedFiles: Boolean(logo || cover),
		save: async (next) => {
			const { bio, ...values } = setUpProfileSchema.parse(next);
			const updated = await send({
				...values,
				bio: bio || null,
				logo: logo?.file ?? null,
				display_image: cover?.file ?? null,
			});
			setShown({ logoUrl: logo?.preview ?? updated.logo, coverUrl: cover?.preview ?? updated.display_image });
			setLogo(null);
			setCover(null);
		},
	});
	const form = saving.values ?? server;

	const errors = React.useMemo<FieldErrors>(() => {
		if (!saving.showErrors) return {};
		const result = setUpProfileSchema.safeParse(form);
		return result.success ? {} : firstErrors(result.error);
	}, [saving.showErrors, form]);

	const setValue = (field: keyof SetUpProfileForm, value: string) =>
		saving.setValues((prev) => ({ ...prev, [field]: value }));
	const update = (field: keyof SetUpProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setValue(field, e.target.value);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (await saving.submit()) toast.success("Profile saved");
		} catch (error) {
			toast.error(ensureError(error).message);
		}
	};

	return {
		form,
		errors,
		logo,
		cover,
		logoUrl: shown.logoUrl,
		coverUrl: shown.coverUrl,
		dirty: saving.dirty || Boolean(logo || cover),
		isSaving: saving.isSaving,
		saving,
		update,
		setValue,
		pickLogo: pickImage(setLogo),
		pickCover: pickImage(setCover),
		removeLogo: () => setLogo(null),
		removeCover: () => setCover(null),
		submit,
	};
}
