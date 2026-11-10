"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import updateManagerProfile from "@/services/account/update-manager-profile";
import useActions from "@/store/actions";
import { ManagerProfile } from "@/types/user.types";

type UpdateParams = Parameters<typeof updateManagerProfile>[0];

export const profileQueryKey = (id: string) => ["manager-profile", id];

// The PUT rewrites the whole profile and turns any switch it doesn't receive off,
// so each tab sends its own changes on top of everything already saved.
function savedValues(profile: ManagerProfile): UpdateParams {
	return {
		id: profile.id,
		name: profile.name,
		bio: profile.bio,
		email: profile.email ?? "",
		phone: profile.phone,
		operating_country_id: profile.operating_country_id,
		logo: null,
		display_image: null,
		refund_policy_type: profile.refund_policy_type,
		refund_policy_days: profile.refund_policy_days,
		automate_refunds: profile.automate_refunds,
		enable_downloads: profile.enable_downloads,
		allow_individual_upload: profile.allow_individual_upload,
		allow_professional_upload: profile.allow_professional_upload,
	};
}

export default function useSaveProfile(profile: ManagerProfile) {
	const queryClient = useQueryClient();
	const { managerProfile } = useActions();
	const [isSaving, setIsSaving] = React.useState(false);

	const save = async (changes: Partial<UpdateParams>, successMessage: string) => {
		setIsSaving(true);
		try {
			const saved = await updateManagerProfile({ ...savedValues(profile), ...changes });
			managerProfile.changeProfile(saved);
			queryClient.setQueryData(profileQueryKey(saved.id), saved);
			queryClient.invalidateQueries({ queryKey: profileQueryKey(saved.id) });
			toast.success(successMessage);
			return saved;
		} catch (error) {
			toast.error(ensureError(error).message);
			return null;
		} finally {
			setIsSaving(false);
		}
	};

	return { save, isSaving };
}
