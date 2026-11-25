"use client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { variables } from "@/constants";
import deleteEvent from "@/services/events/delete-event";
import unpublishEvent from "@/services/events/unpublish-event";
import useActions from "@/store/actions";
import { EventStatus } from "@/types/event-summary.types";

export type ActionableEvent = { id: string; title: string; status: EventStatus; published: boolean; has_sales: boolean };

/** The public page for an event, or "" while the site's address isn't configured. */
export const eventLink = (eventId: string) =>
	variables.EXTERNAL_LINKS.website ? `${variables.EXTERNAL_LINKS.website}/events/${eventId}` : "";

/** Why an event can't be deleted, or null when it can. Once tickets are sold it can only be cancelled. */
export function whyNotDeletable(event: ActionableEvent): string | null {
	if (event.has_sales) return "Tickets have been sold, so it can only be cancelled.";
	return null;
}

/**
 * What the event menu does, wherever it shows: the events list and the event page header. Unpublish and delete
 * expect the caller to have asked first; every action refreshes everything that shows events.
 */
export default function useEventActions({ onDeleted }: { onDeleted?: () => void } = {}) {
	const { ui } = useActions();
	const queryClient = useQueryClient();

	const refresh = (eventId: string) => {
		for (const key of [["manager-events"], ["event-summary", eventId], ["event-details", eventId], ["events"], ["home-dashboard"]]) {
			queryClient.invalidateQueries({ queryKey: key });
		}
	};

	const copyLink = async (event: ActionableEvent) => {
		try {
			await navigator.clipboard.writeText(eventLink(event.id));
			toast.success("Event link copied");
		} catch {
			toast.error("We couldn’t copy the link.");
		}
	};

	const duplicate = (event: ActionableEvent) =>
		ui.changeDialog({ show: true, type: "duplicate_event", data: { eventId: event.id, eventTitle: event.title } });

	/** Unpublishes after the organizer has confirmed. Throws so the confirm dialog can stay open on failure. */
	const unpublish = async (event: ActionableEvent) => {
		await unpublishEvent({ event_id: event.id });
		toast.success("Unpublished. It’s a draft again.");
		refresh(event.id);
	};

	/** Deletes the event after the organizer has confirmed. Throws so the confirm dialog can stay open on failure. */
	const remove = async (event: ActionableEvent) => {
		await deleteEvent({ eventId: event.id });
		toast.success(event.published ? "Event deleted." : "Draft deleted.");
		onDeleted?.();
		refresh(event.id);
	};

	return { copyLink, duplicate, unpublish, remove };
}
