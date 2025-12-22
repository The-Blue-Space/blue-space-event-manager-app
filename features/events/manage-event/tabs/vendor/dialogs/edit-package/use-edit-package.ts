import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import React from "react";
import { editPackageInitial, editPackageSchema, emptyFormField } from "./schema";
import { ZodError } from "zod";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import { toast } from "sonner";
import { sanitizeNumInput } from "@/lib/sanitize-num-input";
import updateVendorPackage from "@/services/events/vendor-packages/update-vendor-package";
import invalidateQuery from "@/lib/invalidate-query";
import useCustomNavigation from "@/hooks/use-navigation";
import { FormSchemaField, VendorPackage } from "@/types/vendor.types";

export default function useEditPackage() {
	const { dialog } = useAppSelector("ui");
	const { activeCurrency, currencies } = useAppSelector("init");
	const [formData, setFormData] = React.useState(editPackageInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = React.useState(false);

	const { params } = useCustomNavigation();
	const eventId = params.event_id as string;

	const { ui } = useActions();

	const open = React.useMemo(() => {
		return dialog.show && dialog.type === "edit_vendor_package";
	}, [dialog]);

	const packageData = dialog.data as VendorPackage | undefined;

	React.useEffect(() => {
		if (open && packageData) {
			// Parse amenities from object to comma-separated string
			const amenitiesStr = packageData.amenities
				? Object.keys(packageData.amenities).join(", ")
				: "";

			setFormData({
				name: packageData.name,
				description: packageData.description || "",
				price: packageData.price,
				currency_id: packageData.currency_id || activeCurrency.id,
				total_quantity: packageData.total_quantity,
				max_per_vendor: packageData.max_per_vendor,
				requires_approval: packageData.requires_approval,
				amenities: amenitiesStr,
				form_schema: packageData.form_schema || [],
			});
		}
	}, [open, packageData, activeCurrency.id]);

	const updateForm = (name: keyof typeof formData, value: string | number | boolean | null) => {
		setErrors((prev) => ({
			...prev,
			[name]: "",
		}));
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "price"
					? sanitizeNumInput(String(value).replace(`${selectedCurrency.symbol}`, ""))
					: value,
		}));
	};

	// Form schema field management
	const addFormField = () => {
		setFormData((prev) => ({
			...prev,
			form_schema: [...prev.form_schema, { ...emptyFormField }],
		}));
	};

	const updateFormField = (index: number, field: Partial<FormSchemaField>) => {
		setFormData((prev) => ({
			...prev,
			form_schema: prev.form_schema.map((f, i) =>
				i === index ? { ...f, ...field } : f
			),
		}));
	};

	const removeFormField = (index: number) => {
		setFormData((prev) => ({
			...prev,
			form_schema: prev.form_schema.filter((_, i) => i !== index),
		}));
	};

	const onOpenChange = () => {
		setFormData(editPackageInitial);
		setErrors({});
		ui.resetDialog();
	};

	const submit = async () => {
		if (!packageData) return;

		setErrors({});
		setIsLoading(true);
		try {
			// Coerce fields to expected types for validation
			const coerced = {
				...formData,
				price: Number(formData.price) || 0,
				total_quantity: Number(formData.total_quantity),
				max_per_vendor: Number(formData.max_per_vendor),
				form_schema: formData.form_schema.map((field) => ({
					...field,
					field_name: field.field_name || field.label.toLowerCase().replace(/\s+/g, "_"),
				})),
			};

			const formValues = editPackageSchema.parse(coerced);

			// Parse amenities from comma-separated string to object
			const amenitiesObj: Record<string, boolean> = {};
			if (formValues.amenities) {
				formValues.amenities.split(",").forEach((a) => {
					const trimmed = a.trim();
					if (trimmed) {
						amenitiesObj[trimmed] = true;
					}
				});
			}

			await updateVendorPackage({
				id: packageData.id,
				event_id: eventId,
				name: formValues.name,
				description: formValues.description || undefined,
				price: formValues.price,
				currency_id: formValues.price > 0 ? formValues.currency_id : null,
				total_quantity: formValues.total_quantity,
				max_per_vendor: formValues.max_per_vendor,
				requires_approval: formValues.requires_approval,
				amenities: amenitiesObj,
				form_schema: formValues.form_schema,
			});

			toast.success("Vendor package updated successfully");
			invalidateQuery(["vendor-packages"]);
			onOpenChange();
		} catch (err) {
			if (err instanceof ZodError) {
				const errors = formatZodErrors(err);
				setErrors(errors);
				return;
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
		addFormField,
		updateFormField,
		removeFormField,
		submit,
	};
}
