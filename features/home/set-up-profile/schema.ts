import { z } from "zod";

export const BIO_MAX_LENGTH = 500;
export const NAME_MAX_LENGTH = 100;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;
// Spaces and characters that show nothing (zero-width, Hangul filler), so "   " or three invisible marks aren't a name
const INVISIBLE = /[\s\u200B-\u200F\u2060-\u2064\uFEFF\u3164\u202A-\u202E\u2066-\u2069]/g;

// Messages are listed in the order they should win: the form shows the first problem per field.
export const setUpProfileSchema = z.object({
	// Mirrors checkOrganizerName on the server
	name: z
		.string()
		.trim()
		.refine((value) => value.replace(INVISIBLE, "").length > 0, "Enter your organizer name.")
		.refine((value) => value.replace(INVISIBLE, "").length >= 3, "Use at least 3 characters.")
		.refine((value) => value.length <= NAME_MAX_LENGTH, `Keep the name to ${NAME_MAX_LENGTH} characters or fewer.`)
		.refine((value) => !/[<>]/.test(value), "The name can’t contain < or >.")
		.refine((value) => !/[\u0000-\u001F\u007F\u202A-\u202E\u2066-\u2069]/.test(value), "Use letters, numbers, spaces and punctuation."),
	bio: z.string().trim().max(BIO_MAX_LENGTH, `Keep your bio to ${BIO_MAX_LENGTH} characters or fewer.`),
	email: z.string().trim().email("Enter a valid email address, like name@example.com."),
	phone: z
		.string()
		.trim()
		.min(1, "Enter a phone number.")
		// Mirrors checkPhone on the server: an optional +, digits, and spaces, dashes, dots or brackets between them
		.refine((value) => /^\+?[0-9 ().-]+$/.test(value), "Use digits only, like +234 800 000 0000.")
		.refine((value) => value.replace(/\D/g, "").length >= MIN_PHONE_DIGITS, "Enter the full number, like +234 800 000 0000.")
		.refine((value) => value.replace(/\D/g, "").length <= MAX_PHONE_DIGITS, `A phone number has at most ${MAX_PHONE_DIGITS} digits.`),
	operating_country_id: z.string().min(1, "Choose the country you operate in."),
});

export type SetUpProfileForm = z.input<typeof setUpProfileSchema>;
