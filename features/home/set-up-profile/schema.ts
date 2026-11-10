import { z } from "zod";

export const BIO_MAX_LENGTH = 500;
const MIN_PHONE_DIGITS = 7;

// Messages are listed in the order they should win: the form shows the first problem per field.
export const setUpProfileSchema = z.object({
	name: z.string().trim().min(1, "Enter your organizer name.").min(3, "Use at least 3 characters."),
	bio: z.string().trim().max(BIO_MAX_LENGTH, `Keep your bio to ${BIO_MAX_LENGTH} characters or fewer.`),
	email: z.string().trim().email("Enter a valid email address, like name@example.com."),
	phone: z
		.string()
		.trim()
		.min(1, "Enter a phone number.")
		.refine((value) => value.replace(/\D/g, "").length >= MIN_PHONE_DIGITS, "Enter the full number, like +234 800 000 0000."),
	operating_country_id: z.string().min(1, "Choose the country you operate in."),
});

export type SetUpProfileForm = z.input<typeof setUpProfileSchema>;
