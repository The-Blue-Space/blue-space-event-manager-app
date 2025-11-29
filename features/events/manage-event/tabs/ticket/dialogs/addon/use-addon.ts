import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import React from "react";
import { addonInitial, addonSchema } from "./schema";
import { ZodError } from "zod";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import { toast } from "sonner";
import { sanitizeNumInput } from "@/lib/sanitize-num-input";
import addEventAddon from "@/services/events/event-addons/add-event-addon";
import updateEventAddon from "@/services/events/event-addons/update-event-addon";
import invalidateQuery from "@/lib/invalidate-query";
import useCustomNavigation from "@/hooks/use-navigation";
import { useQuery } from "@tanstack/react-query";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import { normalizeTimeValue, combineDateAndTimeToIso } from "@/lib/date-time";

export default function useAddon() {
	const { dialog } = useAppSelector("ui");
	const { activeCurrency, currencies } = useAppSelector("init");
	const [formData, setFormData] = React.useState(addonInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = React.useState(false);

	const { params } = useCustomNavigation();
	const eventId = params.event_id as string;

	const { ui } = useActions();

	const open = React.useMemo(() => {
		return dialog.show && (dialog.type === "add_event_addon" || dialog.type === "edit_event_addon");
	}, [dialog]);

	const isEditMode = React.useMemo(() => {
		return dialog.type === "edit_event_addon";
	}, [dialog.type]);

	// Load tickets for multi-select
	const { data: tickets = [] } = useQuery({
		queryKey: ["event-tickets", eventId],
		queryFn: () => getEventTickets({ event_Id: eventId }),
		enabled: !!eventId && open,
	});

	React.useEffect(() => {
		if (open) {
			if (isEditMode && dialog.data) {
				const addon = dialog.data as any;
				setFormData({
					name: addon.name || "",
					description: addon.description || "",
					type: addon.type || "paid",
					price: addon.price || null,
					currency_id: addon.currency_id || activeCurrency.id,
					ticket_ids: addon.ticket_ids || null,
					sales_start_date: addon.sales_start_date || "",
					sales_start_time: normalizeTimeValue(addon.sales_start_time) || null,
					sales_end_date: addon.sales_end_date || null,
					sales_end_time: normalizeTimeValue(addon.sales_end_time) || null,
					expires_at: addon.expires_at || null,
					is_active: addon.is_active ?? true,
				});
			} else {
				setFormData({
					...addonInitial,
					currency_id: activeCurrency.id,
				});
			}
		}
	}, [open, dialog.data, isEditMode, activeCurrency.id]);

	const updateForm = React.useCallback(
		(name: keyof typeof formData, value: any) => {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
			if (name === "type") {
				setFormData((prev) => ({
					...prev,
					type: value as typeof formData.type,
					price: value === "free" ? null : prev.price,
					currency_id: value === "free" ? null : prev.currency_id || activeCurrency.id,
				}));
				return;
			}
			if (name === "price") {
				setFormData((prev) => {
					const selectedCurrency =
						currencies.find((currency) => currency.id === prev.currency_id) ?? activeCurrency;
					return {
						...prev,
						[name]: sanitizeNumInput(value.replace(`${selectedCurrency.symbol}`, "")) as any,
					};
				});
				return;
			}
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		},
		[activeCurrency, currencies]
	);

	const onOpenChange = () => {
		setFormData(addonInitial);
		setErrors({});
		ui.resetDialog();
	};

	const submit = async () => {
		setErrors({});
		setIsLoading(true);
		try {
			const coerced = {
				...formData,
				price: formData.price ? Number(formData.price) : null,
				ticket_ids:
					formData.ticket_ids && formData.ticket_ids.length > 0 ? formData.ticket_ids : null,
			};

			const formValues = addonSchema.parse(coerced);

			// Combine date and time into ISO strings
			const sales_start_iso = combineDateAndTimeToIso(
				formValues.sales_start_date,
				formValues.sales_start_time ?? null
			);
			const sales_end_iso = combineDateAndTimeToIso(
				formValues.sales_end_date,
				formValues.sales_end_time ?? null
			);

			// Cross-field validation
			if (sales_start_iso && sales_end_iso) {
				if (new Date(sales_end_iso).getTime() < new Date(sales_start_iso).getTime()) {
					setErrors((prev) => ({
						...prev,
						sales_end_date: "Sales end cannot be before sales start",
					}));
					return;
				}
			}

			const payload = {
				event_id: eventId,
				type: formValues.type,
				name: formValues.name,
				description: formValues.description || undefined,
				price: formValues.price,
				currency_id: formValues.currency_id,
				ticket_ids: formValues.ticket_ids,
				sales_start_date: sales_start_iso ?? new Date().toISOString(),
				sales_start_time: sales_start_iso ?? new Date().toISOString(),
				sales_end_date: sales_end_iso ?? null,
				sales_end_time: sales_end_iso ?? null,
				expires_at: formValues.expires_at,
				is_active: formValues.is_active,
			};

			if (isEditMode && dialog.data) {
				const addon = dialog.data as any;
				await updateEventAddon({
					id: addon.id,
					...payload,
				});
				toast.success("Addon updated successfully");
			} else {
				await addEventAddon(payload);
				toast.success("Addon created successfully");
			}

			invalidateQuery(["event-addons"]);
			ui.resetDialog();
		} catch (err) {
			if (err instanceof ZodError) {
				const formattedErrors = formatZodErrors(err);
				setErrors(formattedErrors);
				toast.error("Please fix the form errors");
			} else {
				const errMsg = ensureError(err).message;
				toast.error(errMsg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const selectedCurrency = React.useMemo(() => {
		return currencies.find((currency) => currency.id === formData.currency_id) ?? activeCurrency;
	}, [currencies, formData.currency_id, activeCurrency]);

	const currencyOptions = currencies.map((currency) => ({
		title: `${currency.code}`,
		value: currency.id,
	}));

	return {
		open,
		onOpenChange,
		formData,
		errors,
		isLoading,
		submit,
		updateForm,
		currencyOptions,
		selectedCurrency,
		eventId,
		tickets,
		isEditMode,
	};
}
