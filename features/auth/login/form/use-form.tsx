"use client";
import { variables } from "@/constants";
import useCookie from "@/hooks/use-cookie";
import useCustomNavigation from "@/hooks/use-navigation";
import { formatZodErrors } from "@/lib/ensure-error";
import loginAccount from "@/services/account/login-account";
import * as React from "react";
import { z, ZodError } from "zod";
import { describeError, matches } from "../../lib/messages";

const validate = z.object({
	login: z.string().trim().min(1, "Enter your email or username."),
	password: z.string().min(1, "Enter your password."),
});

type FormData = z.infer<typeof validate>;
type FieldErrors = Partial<Record<keyof FormData, string>>;

const initial: FormData = {
	login: "",
	password: "",
};

export default function useForm() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [formData, setFormData] = React.useState<FormData>(initial);
	const [errors, setErrors] = React.useState<FieldErrors>({});
	const [alert, setAlert] = React.useState<{ message: string; unverified?: boolean } | null>(null);

	const { set: setCookie } = useCookie();
	const { navigate } = useCustomNavigation();

	const updateForm = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setErrors((prev) => ({ ...prev, [name]: undefined }));
		setAlert(null);
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAlert(null);

		let values: FormData;
		try {
			values = validate.parse(formData);
		} catch (error) {
			if (error instanceof ZodError) setErrors(formatZodErrors(error));
			return;
		}

		setIsLoading(true);
		try {
			const response = await loginAccount(values);
			setCookie(variables.STORAGE_KEYS.email, response?.user?.email ?? "", { expires: 1 });

			if (variables.IS_DEV) {
				navigate("/verify-mfa?token=123456");
				return;
			}
			navigate("/mfa");
		} catch (error) {
			if (matches(error, "unverified")) {
				setAlert({
					message: "Verify your email before logging in. We sent you a link when you created your account.",
					unverified: true,
				});
			} else {
				setAlert({ message: describeError(error) });
			}
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		formData,
		errors,
		alert,
		updateForm,
		submit,
	};
}
