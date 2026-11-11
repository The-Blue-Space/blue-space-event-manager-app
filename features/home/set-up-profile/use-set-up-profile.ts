"use client";
import * as React from "react";
import { toast } from "sonner";
import type { ZodError } from "zod";
import useSavedForm from "@/hooks/use-saved-form";
import blobReader from "@/lib/blob-reader";
import ensureError from "@/lib/ensure-error";
import invalidateQuery from "@/lib/invalidate-query";
import createManagerProfile from "@/services/account/create-manager-profile";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { setUpProfileSchema, SetUpProfileForm } from "./schema";

export type PickedImage = { file: File; preview: string };
export type FieldErrors = Partial<Record<keyof SetUpProfileForm, string>>;

export function firstErrors(error: ZodError): FieldErrors {
	const errors: FieldErrors = {};
	for (const issue of error.issues) {
		const field = issue.path[0] as keyof SetUpProfileForm;
		errors[field] ??= issue.message;
	}
	return errors;
}

export const pickImage = (setImage: (image: PickedImage) => void) => async (file: File) => {
	if (!file.type.startsWith("image/")) {
		toast.error("Choose an image file, like a JPG or PNG.");
		return;
	}
	setImage({ file, preview: await blobReader(file) });
};

export default function useSetUpProfile() {
	const { account } = useAppSelector("account");
	const { managerProfile: managerProfileActions } = useActions();
	const accountEmail = account?.email ?? "";

	const blank = React.useMemo<SetUpProfileForm>(
		() => ({ name: "", bio: "", email: accountEmail, phone: "", operating_country_id: "" }),
		[accountEmail]
	);
	const [logo, setLogo] = React.useState<PickedImage | null>(null);
	const [cover, setCover] = React.useState<PickedImage | null>(null);

	// Nothing exists to save into until the profile is created, so what's typed is kept on the device instead.
	const saving = useSavedForm<SetUpProfileForm>({
		server: blank,
		resetKey: "profile-setup",
		mode: "manual",
		backup: "profile-setup",
		invalid: (values) => {
			const result = setUpProfileSchema.safeParse(values);
			return result.success ? [] : (Object.keys(firstErrors(result.error)) as (keyof SetUpProfileForm)[]);
		},
		unsavedFiles: Boolean(logo || cover),
		save: async (next) => {
			const { bio, ...values } = setUpProfileSchema.parse(next);
			const profile = await createManagerProfile({
				...values,
				user_id: account.id,
				bio: bio || null,
				logo: logo?.file ?? null,
				display_image: cover?.file ?? null,
			});
			managerProfileActions.changeProfile(profile);
			invalidateQuery(["manager-profile"]);
		},
	});
	const form = saving.values ?? blank;

	// Errors appear after the first submit, then follow the values so each one clears once it's fixed.
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
			if (await saving.submit()) toast.success("Organizer profile created");
		} catch (error) {
			toast.error(ensureError(error).message);
		}
	};

	return {
		form,
		errors,
		logo,
		cover,
		isLoading: saving.isSaving,
		saving,
		accountEmail,
		update,
		setValue,
		pickLogo: pickImage(setLogo),
		pickCover: pickImage(setCover),
		removeLogo: () => setLogo(null),
		removeCover: () => setCover(null),
		submit,
	};
}
