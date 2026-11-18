"use client";
import { formatZodErrors } from "@/lib/ensure-error";
import registerAccount from "@/services/account/register-account";
import * as React from "react";
import { z, ZodError } from "zod";
import { NAME_MAX_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "../constants";
import { describeError, matches, serverMessage } from "../lib/messages";
import { meetsPasswordRules } from "../lib/password";

const validate = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Enter your full name.")
		.max(NAME_MAX_LENGTH, `Your name can be up to ${NAME_MAX_LENGTH} characters.`)
		.refine((name) => !/[<>]/.test(name), "Your name can’t contain < or >."),
	username: z
		.string()
		.trim()
		.toLowerCase()
		.min(USERNAME_MIN_LENGTH, `Your username needs ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters.`)
		.max(USERNAME_MAX_LENGTH, `Your username needs ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters.`)
		// Mirrors the server's ValidateUsername
		.regex(/^[a-z0-9][a-z0-9._]*[a-z0-9]$/, "Use letters, numbers, dots and underscores, starting and ending with a letter or number."),
	email: z.string().trim().email("Enter a valid email address, like name@example.com."),
	// The checklist under the field explains what is missing, so this message is never shown.
	password: z.string().refine(meetsPasswordRules, "Password doesn’t meet the requirements."),
});

type FormData = z.infer<typeof validate>;
type FieldErrors = Partial<Record<keyof FormData, string>>;

const initial = {
	name: "",
	username: "",
	email: "",
	password: "",
};

export default function useRegister() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [formData, setFormData] = React.useState(initial);
	const [errors, setErrors] = React.useState<FieldErrors>({});
	const [alert, setAlert] = React.useState<string | null>(null);
	const [sentTo, setSentTo] = React.useState<string | null>(null);
	const [attempted, setAttempted] = React.useState(false);

	const updateForm = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setErrors((prev) => ({ ...prev, [name]: undefined }));
		setAlert(null);
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);
		setAttempted(true);

		let values: FormData;
		try {
			values = validate.parse(formData);
		} catch (error) {
			if (error instanceof ZodError) setErrors(formatZodErrors(error));
			return;
		}

		setIsLoading(true);
		try {
			await registerAccount(values);
			setSentTo(values.email);
		} catch (error) {
			if (matches(error, "usernameTaken")) {
				setErrors({ username: "That username is taken. Try another one." });
			} else if (/usernames can use/i.test(serverMessage(error))) {
				setErrors({ username: "Use letters, numbers, dots and underscores, starting and ending with a letter or number." });
			} else if (matches(error, "emailExists")) {
				setErrors({ email: "There’s already an account with this email. Log in, or reset your password." });
			} else {
				setAlert(describeError(error));
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		formData,
		errors,
		alert,
		sentTo,
		attempted,
		updateForm,
		submit,
	};
}
