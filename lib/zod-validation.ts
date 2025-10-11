// lib/date-validation.ts
import { z } from "zod";

export interface DateValidationOptions {
	requiredMessage?: string;
	futureDateMessage?: string;
	allowFuture?: boolean;
}

export function dateValidation(options: DateValidationOptions = {}) {
	const {
		requiredMessage = "Date is required",
		futureDateMessage = "Date cannot be in the future",
		allowFuture = false,
	} = options;

	return z
		.string()
		.trim()
		.min(1, requiredMessage)
		.regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy format")
		.transform((val) => {
			// Parse dd/mm/yyyy to Date object
			const [day, month, year] = val.split("/");
			const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

			// Validate the date is valid
			if (isNaN(date.getTime())) {
				throw new Error("Invalid date");
			}

			return date.toISOString();
		})
		.refine(
			(date) => {
				// Additional validation: ensure date is not in the future (if not allowed)
				return allowFuture || new Date(date) <= new Date();
			},
			{
				message: futureDateMessage,
			}
		);
}

// Optional date validation
export function optionalDateValidation(options: DateValidationOptions = {}) {
	const { futureDateMessage = "Date cannot be in the future", allowFuture = false } = options;

	return z
		.string()
		.trim()
		.optional()
		.refine(
			(val) => {
				// If empty, allow it
				if (!val || val === "") return true;

				// If it has a value, validate the format
				return /^\d{2}\/\d{2}\/\d{4}$/.test(val);
			},
			{
				message: "Date must be in dd/mm/yyyy format",
			}
		)
		.transform((val) => {
			// If empty, return empty string
			if (!val || val === "") return "";

			// Parse and convert to ISO
			const [day, month, year] = val.split("/");
			const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

			if (isNaN(date.getTime())) {
				throw new Error("Invalid date");
			}

			return date.toISOString();
		})
		.refine(
			(date) => {
				if (date === "") return true;
				return allowFuture || new Date(date) <= new Date();
			},
			{
				message: futureDateMessage,
			}
		);
}

// file validation
export interface FileValidationOptions {
	requiredMessage?: string;
	allowUrl?: boolean;
	allowAnyString?: boolean;
}
export function fileValidation(options: FileValidationOptions = {}) {
	const { requiredMessage = "File is required", allowUrl = true, allowAnyString = true } = options;

	return z
		.union(
			[
				z.instanceof(File),
				allowUrl ? z.url() : z.never(),
				allowAnyString ? z.string().min(1) : z.never(),
			],
			{ error: requiredMessage }
		)
		.refine(
			(value) => {
				if (value instanceof File) {
					return value instanceof File;
				}
				if (typeof value === "string") {
					return value.trim().length > 0;
				}
				return false;
			},
			{
				message: requiredMessage,
			}
		);
}
// Convenience function for optional files
export function optionalFileValidation(options: FileValidationOptions = {}) {
	const { requiredMessage = "File is required" } = options;
	return z
		.union([z.instanceof(File), z.string(), z.url(), z.null(), z.undefined()], {
			error: requiredMessage,
		})
		.optional();
}
