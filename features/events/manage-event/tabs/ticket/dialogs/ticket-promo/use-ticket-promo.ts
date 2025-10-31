import React from "react";
import useAppSelector from "@/store/hooks";
import useActions from "@/store/actions";
import { useQuery } from "@tanstack/react-query";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import addTicketPromo from "@/services/events/event-ticket-promos/add-ticket-promo";
import updateTicketPromo from "@/services/events/event-ticket-promos/update-ticket-promo";
import getTicketPromo from "@/services/events/event-ticket-promos/get-ticket-promo";
import invalidateQuery from "@/lib/invalidate-query";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import useCustomNavigation from "@/hooks/use-navigation";

export default function useTicketPromo() {
	const { dialog } = useAppSelector("ui");
	const { params } = useCustomNavigation();
	const eventId = params.event_id as string;
	const { ui } = useActions();

	const open = React.useMemo(
		() => dialog.show && dialog.type === "configure_ticket_promo",
		[dialog]
	);

	const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
	const [promoType, setPromoType] = React.useState<"discount" | "free_ticket">("discount");
	const [isActive, setIsActive] = React.useState(true);
	const [saving, setSaving] = React.useState(false);
	const [initialValues, setInitialValues] = React.useState<any | null>(null);

	React.useEffect(() => {
		if (open) {
			const fromDialog = (dialog.data?.ticketId as string) || null;
			setSelectedTicketId(fromDialog);
		} else {
			setSelectedTicketId(null);
			setInitialValues(null);
			setIsActive(true);
			setPromoType("discount");
		}
	}, [open, dialog.data]);

	const { data: tickets = [], isLoading } = useQuery({
		queryKey: ["event-tickets", eventId],
		queryFn: () => getEventTickets({ event_Id: eventId }),
		enabled: !!eventId && open,
	});

	// Load promo if ticket selected
	const { data: existingPromo } = useQuery({
		queryKey: ["ticket-promo", selectedTicketId],
		queryFn: () => getTicketPromo({ ticketId: selectedTicketId || "" }),
		enabled: !!selectedTicketId && open,
	});

	React.useEffect(() => {
		if (existingPromo) {
			setPromoType(existingPromo.promo_type);
			setIsActive(existingPromo.is_active);
			setInitialValues(existingPromo);
		} else {
			setInitialValues(null);
		}
	}, [existingPromo]);

	const onOpenChange = () => ui.resetDialog();

	const handleSave = async () => {
		if (!selectedTicketId) return;
		if (!isActive) return;
		setSaving(true);
		try {
			if (existingPromo) {
				await updateTicketPromo({
					promoId: existingPromo.id,
					ticket_id: selectedTicketId,
					promo_type: promoType,
					payload: initialValues || {},
				});
				toast.success("Promo updated");
			} else {
				await addTicketPromo({
					ticket_id: selectedTicketId,
					promo_type: promoType,
					payload: initialValues || {},
				});
				toast.success("Promo created");
			}
			invalidateQuery(["event-tickets"]);
			ui.resetDialog();
		} catch (err) {
			toast.error(ensureError(err).message);
		} finally {
			setSaving(false);
		}
	};

	return {
		open,
		onOpenChange,
		isLoading,
		tickets,
		selectedTicketId,
		setSelectedTicketId,
		isActive,
		setIsActive,
		promoType,
		setPromoType,
		initialValues,
		setInitialValues,
		saving,
		handleSave,
	};
}
