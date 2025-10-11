import { FORM_FIELDS } from "@/components/app/form-input/form.types";

export const formFields: FORM_FIELDS[] = [
	{
		name: "login",
		type: "text",
		label: "Email or Username",
		placeholder: "Enter Email or Username",
		required: true,
	},

	{
		name: "password",
		type: "password",
		label: "Password",
		placeholder: "Enter Password",
		required: true,
	},
];
