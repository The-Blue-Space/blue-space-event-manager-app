"use client";
import { variables } from "@/constants";
import useCustomNavigation from "@/hooks/use-navigation";
import useStorage from "@/hooks/use-storage";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import loginAccount from "@/services/account/login-account";


import * as React from "react";

import { toast } from "sonner";
import { z, ZodError } from "zod";

const validate = z.object({
	login: z.string().trim().min(1, "Login is required"),
	password: z.string().trim().min(1, "Password is required"),
});

type FormData = z.infer<typeof validate>;
const initial: FormData = {
	login: "",
	password: "",
};
export default function useForm() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [formData, setFormData] = React.useState<FormData>(initial);
	const [errors, setErrors] = React.useState({});

	const { set: setStorage } = useStorage();

	const emailKey = variables.STORAGE_KEYS.email;

	const { navigate } = useCustomNavigation();

	const updateForm = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setErrors({});
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const formValues = validate.parse(formData);

			const response = await loginAccount(formValues);
			toast.success("Login successful", {
				// description: "syncing data...",
			});
			// account.changeAccount(response.user);

			setStorage(emailKey, response?.user?.email ?? "");

			if(variables.IS_DEV){
				navigate("/verify-mfa?token=123456")
				return 
			}

			navigate("/mfa");
		} catch (error) {
			if (error instanceof ZodError) {
				setErrors(formatZodErrors(error));
				return;
			}
			const errMsg = ensureError(error);
			toast.error(errMsg.message, {
				
			});
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		formData,
		errors,
		updateForm,
		submit,
	};
}
