"use client";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fullLabel } from "@/features/events/manage-event/tabs/basic-info/lagos-time";
import ensureError from "@/lib/ensure-error";
import publishEvent from "@/services/events/publish-event";
import unpublishEvent from "@/services/events/unpublish-event";
import useActions from "@/store/actions";

/**
 * Publishing an event now or at a time, and taking a scheduled one back to draft. Publishing waits for pending saves
 * on Details, so guests never get the version from before your last edit.
 */
export default function usePublishing(eventId: string, settled: () => Promise<boolean>) {
	const { ui } = useActions();
	const queryClient = useQueryClient();
	const [choosingTime, setChoosingTime] = React.useState(false);

	const refresh = () => {
		for (const key of [["event-summary", eventId], ["event-details", eventId], ["events"], ["manager-events"], ["home-dashboard"]]) {
			queryClient.invalidateQueries({ queryKey: key });
		}
	};
	const failed = (error: unknown) => toast.error(ensureError(error).message);

	const publish = useMutation({
		mutationFn: (at?: number) => publishEvent({ event_id: eventId, publish_at: at ? new Date(at).toISOString() : undefined }),
		onSuccess: (_, at) => {
			toast.success(at ? `Scheduled. It goes live on its own on ${fullLabel(at)}.` : "Published. Guests can find it now.");
			setChoosingTime(false);
			refresh();
		},
	});
	const draft = useMutation({
		mutationFn: () => unpublishEvent({ event_id: eventId }),
		onSuccess: () => {
			toast.success("Back to draft. It won’t go live on its own.");
			refresh();
		},
		onError: failed,
	});

	const whenSaved = async (run: () => void) => {
		if (await settled()) return run();
		ui.changeDialog({
			show: true,
			type: "info_dialog",
			data: {
				title: "Publish without your latest changes?",
				text: "Some changes on Details aren’t saved, so guests won’t see them. Fix them first, or publish without them.",
			},
			action: run,
		});
	};

	return {
		isBusy: publish.isPending || draft.isPending,
		choosingTime,
		publishNow: () => whenSaved(() => publish.mutate(undefined, { onError: failed })),
		chooseTime: () => whenSaved(() => setChoosingTime(true)),
		closeTime: () => setChoosingTime(false),
		schedule: (at: number) => publish.mutateAsync(at),
		backToDraft: () => draft.mutate(),
	};
}
