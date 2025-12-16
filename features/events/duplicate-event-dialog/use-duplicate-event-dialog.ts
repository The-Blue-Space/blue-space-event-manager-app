import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import getEventDuplicationPreview, {
	EventDuplicationPreview,
} from "@/services/events/get-event-duplication-preview";
import duplicateEvent, { DuplicateEventOptions } from "@/services/events/duplicate-event";
import useCustomNavigation from "@/hooks/use-navigation";
import ensureError from "@/lib/ensure-error";

export default function useDuplicateEventDialog() {
	const { ui } = useActions();
	const { dialog } = useAppSelector("ui");
	const { navigate } = useCustomNavigation();

	const eventId = dialog.data?.eventId as string | undefined;
	const isOpen = dialog.show && dialog.type === "duplicate_event";

	// Form state
	const [includeTickets, setIncludeTickets] = useState(true);
	const [includeAddons, setIncludeAddons] = useState(true);
	const [includePromos, setIncludePromos] = useState(true);
	const [reinviteAttendees, setReinviteAttendees] = useState(false);

	// Fetch preview data
	const {
		data: previewData,
		isLoading: isLoadingPreview,
		error: previewError,
	} = useQuery<EventDuplicationPreview>({
		queryKey: ["event-duplication-preview", eventId],
		queryFn: () => getEventDuplicationPreview({ eventId: eventId! }),
		enabled: !!eventId && isOpen,
	});

	// Duplication mutation
	const { mutate: doDuplicate, isPending: isDuplicating } = useMutation({
		mutationFn: (options: DuplicateEventOptions) =>
			duplicateEvent({ eventId: eventId!, options }),
		onSuccess: (response) => {
			toast.success(response.message || "Event duplicated successfully!");
			if (response.invited_count && response.invited_count > 0) {
				toast.info(`${response.invited_count} attendee(s) have been invited.`);
			}
			handleClose();
			navigate(`/events/${response.event.id}`);
		},
		onError: (error) => {
			const errMsg = ensureError(error).message;
			toast.error(errMsg || "Failed to duplicate event");
		},
	});

	// Check if event is ticket-based
	const isTicketBasedEvent = useMemo(() => {
		return previewData?.event.access_type === "ticket-based" || previewData?.event.access_type === "ticket";
	}, [previewData?.event.access_type]);

	// Has content to include
	const hasTickets = (previewData?.tickets?.length ?? 0) > 0;
	const hasAddons = (previewData?.addons?.length ?? 0) > 0;
	const hasPromos = (previewData?.promos?.length ?? 0) > 0;
	const hasAttendees = (previewData?.previous_attendees?.length ?? 0) > 0;

	// Handlers
	const handleClose = useCallback(() => {
		ui.resetDialog();
		// Reset form state
		setIncludeTickets(true);
		setIncludeAddons(true);
		setIncludePromos(true);
		setReinviteAttendees(false);
	}, [ui]);

	const handleSubmit = useCallback(() => {
		// When reinvite is enabled, invite all previous attendees
		const allAttendeeIds = previewData?.previous_attendees?.map((a) => a.id) ?? [];

		const options: DuplicateEventOptions = {
			include_tickets: includeTickets && hasTickets,
			include_addons: includeAddons && hasAddons,
			include_promos: includePromos && hasPromos && includeTickets,
			reinvite_attendees: reinviteAttendees && !isTicketBasedEvent && hasAttendees,
			attendee_ids: reinviteAttendees && !isTicketBasedEvent && hasAttendees ? allAttendeeIds : [],
		};
		doDuplicate(options);
	}, [
		includeTickets,
		includeAddons,
		includePromos,
		reinviteAttendees,
		hasTickets,
		hasAddons,
		hasPromos,
		hasAttendees,
		isTicketBasedEvent,
		previewData?.previous_attendees,
		doDuplicate,
	]);

	return {
		isOpen,
		previewData,
		isLoadingPreview,
		previewError,
		isDuplicating,
		isTicketBasedEvent,
		hasTickets,
		hasAddons,
		hasPromos,
		hasAttendees,
		// Form state
		includeTickets,
		setIncludeTickets,
		includeAddons,
		setIncludeAddons,
		includePromos,
		setIncludePromos,
		reinviteAttendees,
		setReinviteAttendees,
		// Handlers
		handleClose,
		handleSubmit,
	};
}
