import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import React from "react";
import { editTicketInitial, editTicketSchema } from "./schema";
import { ZodError } from "zod";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import { toast } from "sonner";
import { sanitizeNumInput } from "@/lib/sanitize-num-input";
import invalidateQuery from "@/lib/invalidate-query";
import { EventTicket } from "@/types/event-ticket.types";
import updateEventTicket from "@/services/events/event-tickets/update-event-ticket";

export default function useEditTicket() {
	const { dialog } = useAppSelector("ui");
	const { activeCurrency, currencies } = useAppSelector("init");
	const [formData, setFormData] = React.useState(editTicketInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = React.useState(false);
	const [editingPerk, setEditingPerk] = React.useState<number | null>(null);

	const { ui } = useActions();

	const open = React.useMemo(() => {
		return dialog.show && dialog.type === "edit_event_ticket";
	}, [dialog]);

	React.useEffect(() => {
		if (open && dialog.data) {
			const data = dialog.data as EventTicket;
			setFormData((prev) => ({
				...prev,
				type: data.type ?? "paid",
				name: data.name ?? "",
				description: data.description ?? "",
				price: data.price ?? null,
				currency_id: data.currency_id ?? activeCurrency.id,
				minimum_quantity: data.minimum_quantity ?? 1,
				maximum_quantity: data.maximum_quantity ?? null,
				total_quantity: data.total_quantity ?? null,
				perks: data.perks.join(", ") ?? "",
				sales_start_date: data.sales_start_date ?? new Date().toISOString(),
				sales_start_time: data.sales_start_time ?? "12:00:AM",
				sales_end_date: data.sales_end_date ?? null,
				sales_end_time: data.sales_end_time ?? null,
				expires_at: data.expires_at ?? null,
				unlimited_quantity: data.unlimited_quantity ?? false,
				absolve_fee: data.absolve_fee ?? true,
			}));
		}
	}, [open, dialog.data, activeCurrency.id]);

	const updateForm = (name: keyof typeof formData, value: string) => {
		setErrors((prev) => ({
			...prev,
			[name]: "",
		}));
		if (name === "type") {
			const typesWithNoPrice = ["free", "donation"];
			setFormData((prev) => ({
				...prev,
				type: value as typeof formData.type,
				price: typesWithNoPrice.includes(value) ? null : prev.price,
			}));
			return;
		}
		if (name === "unlimited_quantity") {
			if (value == "true") {
				setFormData((prev) => ({
					...prev,
					unlimited_quantity: true,
					total_quantity: "" as any,
				}));
				return;
			}
			// value == "false" path -> re-enable and require total_quantity
			setFormData((prev) => ({
				...prev,
				unlimited_quantity: false,
				total_quantity: (prev.total_quantity as any) || ("" as any),
			}));
			return;
		}
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "price"
					? sanitizeNumInput(value.replace(`${selectedCurrency.symbol}`, ""))
					: value,
		}));
	};

	const handleEditPerk = (index: number) => {
		setEditingPerk(index);
	};

	const handleCancelEditPerk = () => {
		setEditingPerk(null);
	};

	const onOpenChange = () => {
		setFormData(editTicketInitial);
		ui.resetDialog();
	};

	function combineDateTimeToIso(dateStr?: string | null, timeStr?: string | null) {
		if (!dateStr) return null;
		try {
			const date = new Date(dateStr);
			if (timeStr) {
				const [h, m] = timeStr.split(":");
				date.setHours(Number(h));
				date.setMinutes(Number(m));
				date.setSeconds(0);
				date.setMilliseconds(0);
			}
			return date.toISOString();
		} catch {
			return null;
		}
	}

	const submit = async () => {
		setErrors({});
		setIsLoading(true);
		try {
			// Coerce fields to expected types for validation
			const coerced = {
				...formData,
				absolve_fee: formData.absolve_fee == true,
				price:
					formData.type === "paid" && formData.price !== null && formData.price !== ("" as any)
						? Number(formData.price)
						: null,
				minimum_quantity: Number(formData.minimum_quantity),
				maximum_quantity:
					formData.maximum_quantity === null || formData.maximum_quantity === ("" as any)
						? null
						: Number(formData.maximum_quantity),
				total_quantity: formData.unlimited_quantity
					? null
					: formData.total_quantity === ("" as any)
					? null
					: Number(formData.total_quantity),
			};

			const formValues = editTicketSchema.parse(coerced);

			// Cross-field guards
			const sales_start_iso = combineDateTimeToIso(
				formValues.sales_start_date,
				formValues.sales_start_time ?? null
			);
			const sales_end_iso = combineDateTimeToIso(
				formValues.sales_end_date,
				formValues.sales_end_time ?? null
			);
			if (sales_start_iso && sales_end_iso) {
				if (new Date(sales_end_iso).getTime() < new Date(sales_start_iso).getTime()) {
					setErrors((prev) => ({
						...prev,
						sales_end_date: "Sales end cannot be before sales start",
					}));
					return;
				}
			}

			await updateEventTicket({
				id: dialog.data?.id as string,
				type: formValues.type,
				name: formValues.name,
				description: formValues.description || undefined,
				price: formValues.price,
				currency_id: formValues.type === "paid" ? formValues.currency_id : null,
				minimum_quantity: formValues.minimum_quantity,
				maximum_quantity: formValues.maximum_quantity,
				total_quantity: formValues.unlimited_quantity
					? null
					: Number(formValues.total_quantity ?? 0),
				perks: formValues.perks.split(","),
				sales_start_date: formValues.sales_start_date || new Date().toISOString(),
				sales_start_time: formValues.sales_start_time || "12:00:AM",
				sales_end_date: formValues.sales_end_date || null,
				sales_end_time: formValues.sales_end_time || null,
				expires_at: formValues.expires_at || null,
				unlimited_quantity: formValues.unlimited_quantity,
				absolve_fee: formValues.absolve_fee,
			});

			toast.success("Ticket updated successfully");
			invalidateQuery(["event-tickets"]);
			onOpenChange();
		} catch (err) {
			if (err instanceof ZodError) {
				const errors = formatZodErrors(err);
				setErrors(errors);

				throw err
			}
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
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
		currencyOptions,
		selectedCurrency,
		onOpenChange,
		formData,
		errors,
		isLoading,
		updateForm,
		editingPerk,
		handleEditPerk,
		handleCancelEditPerk,
		submit,
	};
}
