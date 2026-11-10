"use client";
import * as React from "react";
import { toast } from "sonner";
import type { ZodError } from "zod";
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

	const [form, setForm] = React.useState<SetUpProfileForm>({
		name: "",
		bio: "",
		email: accountEmail,
		phone: "",
		operating_country_id: "",
	});
	const [logo, setLogo] = React.useState<PickedImage | null>(null);
	const [cover, setCover] = React.useState<PickedImage | null>(null);
	const [attempted, setAttempted] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	// Errors appear after the first submit, then follow the values so each one clears once it's fixed.
	const errors = React.useMemo<FieldErrors>(() => {
		if (!attempted) return {};
		const result = setUpProfileSchema.safeParse(form);
		return result.success ? {} : firstErrors(result.error);
	}, [attempted, form]);

	const setValue = (field: keyof SetUpProfileForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
	const update = (field: keyof SetUpProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setValue(field, e.target.value);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAttempted(true);
		const result = setUpProfileSchema.safeParse(form);
		if (!result.success) return;

		const { bio, ...values } = result.data;
		setIsLoading(true);
		try {
			const profile = await createManagerProfile({
				...values,
				user_id: account.id,
				bio: bio || null,
				logo: logo?.file ?? null,
				display_image: cover?.file ?? null,
			});
			managerProfileActions.changeProfile(profile);
			invalidateQuery(["manager-profile"]);
			toast.success("Organizer profile created");
		} catch (error) {
			toast.error(ensureError(error).message);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		form,
		errors,
		logo,
		cover,
		isLoading,
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
