import { z } from "zod";
import { FormSchemaField } from "@/types/vendor.types";

export const formSchemaFieldSchema = z.object({
	field_name: z.string().min(1, "Field name is required"),
	field_type: z.enum(["text", "textarea", "number", "select", "checkbox"]),
	label: z.string().min(1, "Label is required"),
	required: z.boolean(),
	placeholder: z.string().optional(),
	options: z.array(z.string()).optional(),
});

export const newPackageSchema = z.object({
	name: z.string().trim().min(3, "Package name is required"),
	description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
	price: z.number().min(0, "Price must be 0 or greater"),
	currency_id: z.string().trim().nullable(),
	total_quantity: z.number().positive("Quantity must be greater than 0"),
	max_per_vendor: z.number().positive("Max per vendor must be greater than 0"),
	requires_approval: z.boolean().nullable(),
	amenities: z.string().optional(), // Comma-separated amenities
	form_schema: z.array(formSchemaFieldSchema),
});

export type NewPackageFormData = z.infer<typeof newPackageSchema>;

export const newPackageInitial: NewPackageFormData = {
	name: "",
	description: "",
	price: 0,
	currency_id: null,
	total_quantity: 10,
	max_per_vendor: 1,
	requires_approval: null,
	amenities: "",
	form_schema: [],
};

export const emptyFormField: FormSchemaField = {
	field_name: "",
	field_type: "text",
	label: "",
	required: false,
	placeholder: "",
	options: [],
};
