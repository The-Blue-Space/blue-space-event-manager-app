import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import React from "react";
import { newTicketInitial, newTicketSchema } from "./schema";
import { ZodError } from "zod";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import { toast } from "sonner";
import { sanitizeNumInput } from "@/lib/sanitize-num-input";
import addEventTicket from "@/services/events/event-tickets/add-event-ticket";
import invalidateQuery from "@/lib/invalidate-query";
import useCustomNavigation from "@/hooks/use-navigation";

export default function useNewTicket() {
	const { dialog } = useAppSelector("ui");
	const { activeCurrency, currencies } = useAppSelector("init");
	const [formData, setFormData] = React.useState(newTicketInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = React.useState(false);

	const { params } = useCustomNavigation();
	const eventId = params.event_id as string;

	const { ui } = useActions();

	const open = React.useMemo(() => {
		return dialog.show && dialog.type === "add_event_ticket";
	}, [dialog]);

	React.useEffect(() => {
		if (open && dialog.data) {
			setFormData((prev) => ({
				...prev,
				type: dialog.data?.ticketType ?? "paid",
				currency_id: activeCurrency.id,
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

	const onOpenChange = () => {
		setFormData(newTicketInitial);
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

			const formValues = newTicketSchema.parse(coerced);

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

			await addEventTicket({
				event_id: eventId,
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

			toast.success("Ticket created successfully");
			invalidateQuery(["event-tickets"]);
			onOpenChange();
		} catch (err) {
			if (err instanceof ZodError) {
				const errors = formatZodErrors(err);
				setErrors(errors);
				throw err;
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
		submit,
	};
}
