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

// One profile save at a time, across both Settings panels.
let queue: Promise<unknown> = Promise.resolve();

export default function useSaveProfile(profile: ManagerProfile) {
	const queryClient = useQueryClient();
	const { managerProfile } = useActions();
	const [isSaving, setIsSaving] = React.useState(false);

	/** Saves the changes on top of the latest saved profile. Throws if the save fails. */
	const send = React.useCallback(
		(changes: Partial<UpdateParams>) => {
			const job = queue.then(async () => {
				// Only this panel's changes: the server keeps every field it isn't sent, so a stale tab can't undo another's save
				const saved = await updateManagerProfile({ ...changes, id: profile.id });
				managerProfile.changeProfile(saved);
				queryClient.setQueryData(profileQueryKey(saved.id), saved);
				return saved;
			});
			queue = job.catch(() => undefined);
			return job;
		},
		[queryClient, managerProfile, profile]
	);

	/** Saves with a message either way; returns null if it fails. */
	const save = async (changes: Partial<UpdateParams>, successMessage: string) => {
		setIsSaving(true);
		try {
			const saved = await send(changes);
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

	return { save, send, isSaving };
}
