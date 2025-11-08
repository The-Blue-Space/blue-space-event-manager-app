import { z } from "zod";

export const addBankSchema = z.object({
	bank_name: z.string().min(1, "Bank name is required"),
	bank_code: z.string().min(1, "Bank code is required"),
	account_number: z
		.string()
		.min(8, "Account number must be at least 8 digits")
		.regex(/^\d+$/, "Account number must be numeric"),
	account_name: z.string().min(3, "Account name must be at least 3 characters"),
	otp: z.string().regex(/^\d{4,6}$/, "OTP must be 4-6 digits"),
});

export type AddBankFormData = z.infer<typeof addBankSchema>;

export const addBankInitial: AddBankFormData = {
	bank_name: "",
	bank_code: "",
	account_number: "",
	account_name: "",
	otp: "",
};
