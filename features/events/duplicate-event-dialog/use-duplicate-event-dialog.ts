import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import duplicateEvent from "@/services/events/duplicate-event";
import getEventDuplicationPreview, { EventDuplicationPreview } from "@/services/events/get-event-duplication-preview";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";

/** The Duplicate dialog: name the copy, choose what else comes with it, and who gets invited when it's published. */
export default function useDuplicateEventDialog() {
	const { ui } = useActions();
	const { dialog } = useAppSelector("ui");
	const router = useRouter();
	const queryClient = useQueryClient();

	const eventId = dialog.data?.eventId as string | undefined;
	const eventTitle = (dialog.data?.eventTitle as string | undefined) ?? "";
	const isOpen = dialog.show && dialog.type === "duplicate_event" && Boolean(eventId);

	const [title, setTitle] = React.useState("");
	const [titleTouched, setTitleTouched] = React.useState(false);
	const [includeTickets, setIncludeTickets] = React.useState(true);
	const [includeAddons, setIncludeAddons] = React.useState(true);
	const [includePromos, setIncludePromos] = React.useState(true);
	const [inviteGuests, setInviteGuests] = React.useState(true);
	const [chosen, setChosen] = React.useState<Set<string>>(new Set());

	const preview = useQuery<EventDuplicationPreview>({
		queryKey: ["event-duplication-preview", eventId],
		queryFn: () => getEventDuplicationPreview({ eventId: eventId! }),
		enabled: isOpen,
	});

	// Start each opening fresh: the original's name with "(Copy)", everything ticked, everyone chosen.
	React.useEffect(() => {
		if (!isOpen) return;
		setTitle(`${eventTitle} (Copy)`);
		setTitleTouched(false);
		setIncludeTickets(true);
		setIncludeAddons(true);
		setIncludePromos(true);
		setInviteGuests(true);
	}, [isOpen, eventId, eventTitle]);

	const guests = React.useMemo(() => preview.data?.previous_attendees ?? [], [preview.data]);
	React.useEffect(() => setChosen(new Set(guests.map((guest) => guest.id))), [guests]);

	const isTicketed = preview.data?.event.access_type === "ticket-based";
	const tickets = preview.data?.tickets ?? [];
	const addons = preview.data?.addons ?? [];
	const promos = preview.data?.promos ?? [];
	const canInvite = !isTicketed && guests.length > 0;
	const inviting = canInvite && inviteGuests && chosen.size > 0;
	const titleError = titleTouched && !title.trim() ? "Give the copy a name." : "";

	const close = React.useCallback(() => ui.resetDialog(), [ui]);

	const duplicate = useMutation({
		mutationFn: () =>
			duplicateEvent({
				eventId: eventId!,
				options: {
					title: title.trim(),
					include_tickets: includeTickets && tickets.length > 0,
					include_addons: includeAddons && addons.length > 0,
					include_promos: includePromos && includeTickets && promos.length > 0,
					reinvite_attendees: inviting,
					attendee_ids: inviting ? [...chosen] : [],
				},
			}),
		onSuccess: (response) => {
			const invited = response.invited_count ?? 0;
			toast.success(
				invited > 0
					? `Copy made. ${invited === 1 ? "1 guest gets an invite" : `${invited} guests get invites`} when you publish it. Pick its date next.`
					: "Copy made. Pick its date next."
			);
			for (const key of [["manager-events"], ["events"], ["home-dashboard"]]) queryClient.invalidateQueries({ queryKey: key });
			close();
			router.push(`/events/${response.event.id}?tab=details`);
		},
		onError: (error) => toast.error(ensureError(error).message || "We couldn’t make the copy. Try again."),
	});

	const submit = () => {
		setTitleTouched(true);
		if (!title.trim()) return;
		duplicate.mutate();
	};

	const toggleGuest = (id: string) =>
		setChosen((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return {
		isOpen,
		close,
		preview,
		eventTitle,
		title,
		setTitle,
		titleError,
		onTitleBlur: () => setTitleTouched(true),
		isTicketed,
		tickets,
		addons,
		promos,
		includeTickets,
		setIncludeTickets,
		includeAddons,
		setIncludeAddons,
		includePromos,
		setIncludePromos,
		guests,
		canInvite,
		inviteGuests,
		setInviteGuests,
		inviting,
		chosen,
		toggleGuest,
		chooseAll: () => setChosen(new Set(guests.map((guest) => guest.id))),
		clearChosen: () => setChosen(new Set()),
		submit,
		isDuplicating: duplicate.isPending,
	};
}
