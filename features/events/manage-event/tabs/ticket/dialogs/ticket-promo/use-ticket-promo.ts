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
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import useCustomNavigation from "@/hooks/use-navigation";
import { discountSchema, freebieSchema, PromoFormState, promoFormInitial } from "./schema";
import { PromoType } from "@/types/event-ticket.types";
import { combineDateAndTimeToIso, normalizeTimeValue } from "@/lib/date-time";
import { ZodError } from "zod";

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
	const [formData, setFormData] = React.useState<PromoFormState>(promoFormInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [saving, setSaving] = React.useState(false);

	const resetState = React.useCallback(() => {
		setFormData(promoFormInitial);
		setErrors({});
		setSelectedTicketId(null);
	}, []);

	React.useEffect(() => {
		if (open) {
			const fromDialog = (dialog.data?.ticketId as string) || null;
			setSelectedTicketId(fromDialog);
		} else {
			resetState();
		}
	}, [open, dialog.data, resetState]);

	const { data: tickets = [], isLoading } = useQuery({
		queryKey: ["event-tickets", eventId],
		queryFn: () => getEventTickets({ event_Id: eventId }),
		enabled: !!eventId && open,
	});

	const { data: existingPromo } = useQuery({
		queryKey: ["ticket-promo", selectedTicketId],
		queryFn: () => getTicketPromo({ ticketId: selectedTicketId || "" }),
		enabled: !!selectedTicketId && open,
	});

	const mapPromoToState = React.useCallback((promo: any): PromoFormState => {
		return {
			promo_type: promo.promo_type ?? "discount",
			name: promo.name || "",
			description: promo.description || "",
			note: promo.note || "",
			discount_type: promo.discount_type || "percentage",
			discount_percentage: promo.discount_percentage ? String(promo.discount_percentage) : "",
			discount_amount: promo.discount_amount ? String(promo.discount_amount) : "",
			free_ticket_quantity: promo.free_ticket_quantity ? String(promo.free_ticket_quantity) : "",
			min_purchase_quantity: promo.min_purchase_quantity ? String(promo.min_purchase_quantity) : "",
			max_purchase_quantity: promo.max_purchase_quantity ? String(promo.max_purchase_quantity) : "",
			discount_start_date: promo.discount_start_date || null,
			discount_end_date: promo.discount_end_date || null,
			sales_start_date: promo.sales_start_date || "",
			sales_start_time: normalizeTimeValue(promo.sales_start_time) || null,
			sales_end_date: promo.sales_end_date || null,
			sales_end_time: normalizeTimeValue(promo.sales_end_time) || null,
			is_active: promo.is_active ?? true,
		};
	}, []);

	React.useEffect(() => {
		if (!open) return;
		if (existingPromo) {
			setFormData(mapPromoToState(existingPromo));
			setErrors({});
		} else {
			setFormData((prev) => ({
				...promoFormInitial,
				promo_type: prev.promo_type,
				is_active: true,
			}));
			setErrors({});
		}
	}, [existingPromo, open, mapPromoToState]);

	const onOpenChange = () => ui.resetDialog();

	const updateForm = React.useCallback(
		<K extends keyof PromoFormState>(field: K, value: PromoFormState[K]) => {
			setErrors((prev) => ({ ...prev, [field as string]: "" }));
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[]
	);

	const handlePromoTypeChange = React.useCallback((type: PromoType) => {
		setFormData((prev) => {
			if (prev.promo_type === type) return prev;
			const shared = {
				name: prev.name,
				description: prev.description,
				note: prev.note,
				min_purchase_quantity: prev.min_purchase_quantity,
				max_purchase_quantity: prev.max_purchase_quantity,
				sales_start_date: prev.sales_start_date,
				sales_start_time: prev.sales_start_time,
				sales_end_date: prev.sales_end_date,
				sales_end_time: prev.sales_end_time,
				is_active: prev.is_active,
			};
			return {
				...promoFormInitial,
				promo_type: type,
				...shared,
				...(type === "discount"
					? {
							discount_start_date: prev.discount_start_date,
							discount_end_date: prev.discount_end_date,
					  }
					: {}),
			};
		});
		setErrors({});
	}, []);

	const handleSave = async () => {
		if (!selectedTicketId) {
			toast.error("Select a ticket first");
			return;
		}
		// if (!formData.is_active) {
		// 	toast.error("Enable the promo to save changes");
		// 	return;
		// }

		setSaving(true);
		try {
			const numeric = {
				...formData,
				discount_percentage: formData.discount_percentage
					? Number(formData.discount_percentage)
					: null,
				discount_amount: formData.discount_amount ? Number(formData.discount_amount) : null,
				free_ticket_quantity: formData.free_ticket_quantity
					? Number(formData.free_ticket_quantity)
					: null,
				min_purchase_quantity: formData.min_purchase_quantity
					? Number(formData.min_purchase_quantity)
					: null,
				max_purchase_quantity: formData.max_purchase_quantity
					? Number(formData.max_purchase_quantity)
					: null,
				discount_start_date: formData.discount_start_date,
				discount_end_date: formData.discount_end_date,
			};

			const schema = formData.promo_type === "discount" ? discountSchema : freebieSchema;
			const validated = schema.parse(numeric);

			const salesStartIso = combineDateAndTimeToIso(
				validated.sales_start_date,
				validated.sales_start_time ?? null
			);
			const salesEndIso = combineDateAndTimeToIso(
				validated.sales_end_date ?? undefined,
				validated.sales_end_time ?? null
			);

			if (salesStartIso && salesEndIso) {
				if (new Date(salesEndIso).getTime() < new Date(salesStartIso).getTime()) {
					setErrors((prev) => ({
						...prev,
						sales_end_date: "Sales end cannot be before sales start",
					}));
					setSaving(false);
					return;
				}
			}

			const payload: any = {
				ticket_id: selectedTicketId,
				promo_type: validated.promo_type,
				name: validated.name,
				description: validated.description || undefined,
				note: validated.note || undefined,
				min_purchase_quantity: validated.min_purchase_quantity ?? null,
				max_purchase_quantity: validated.max_purchase_quantity ?? null,
				is_active: formData.is_active,
				sales_start_date: salesStartIso ?? new Date().toISOString(),
				sales_start_time: salesStartIso ?? new Date().toISOString(),
				sales_end_date: salesEndIso ?? null,
				sales_end_time: salesEndIso ?? null,
			};

			if (validated.promo_type === "discount") {
				payload.discount_type = validated.discount_type;
				payload.discount_percentage =
					validated.discount_type === "percentage" ? validated.discount_percentage : 0;
				payload.discount_amount =
					validated.discount_type === "fixed" ? validated.discount_amount : 0;
				payload.free_ticket_quantity = null;
				payload.discount_start_date = validated.discount_start_date ?? salesStartIso ?? null; //TODO: Might come back to this.
				payload.discount_end_date = validated.discount_end_date ?? new Date().toISOString() ?? null;
			} else {
				payload.free_ticket_quantity = validated.free_ticket_quantity;
				payload.discount_type = undefined;
				payload.discount_percentage = null;
				payload.discount_amount = null;
				payload.discount_start_date = null;
				payload.discount_end_date = null;
			}

			if (existingPromo) {
				await updateTicketPromo({
					promoId: existingPromo.id,
					...payload,
				});
				toast.success("Promo updated");
			} else {
				await addTicketPromo(payload);
				toast.success("Promo created");
			}
			invalidateQuery(["event-tickets"]);
			ui.resetDialog();
		} catch (err) {
			if (err instanceof ZodError) {
				const formatted = formatZodErrors(err);
				setErrors(formatted);
				toast.error("Please fix the highlighted fields");
			} else {
				toast.error(ensureError(err).message);
			}
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
		formData,
		errors,
		updateForm,
		handlePromoTypeChange,
		saving,
		handleSave,
	};
}
