"use client";

import React from "react";
import { addBankSchema, addBankInitial, AddBankFormData } from "./schema";
import { formatZodErrors } from "@/lib/ensure-error";
import getBanks from "@/services/finance/get-banks";
import verifyBankAccount from "@/services/finance/verify-bank-account";
import requestBankOTP from "@/services/finance/request-bank-otp";
import addBankAccount from "@/services/finance/add-bank-account";
import { useQuery } from "@tanstack/react-query";
import { Bank } from "@/types/bank.types";
import { toast } from "sonner";
import { ZodError } from "zod";
import invalidateQuery from "@/lib/invalidate-query";

type UseAddBankProps = {
	open: boolean;
	onClose: () => void;
};

export default function useAddBank({ open, onClose }: UseAddBankProps) {
	const [formData, setFormData] = React.useState<AddBankFormData>(addBankInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = React.useState(false);
	const [isVerifying, setIsVerifying] = React.useState(false);
	const [isRequestingOTP, setIsRequestingOTP] = React.useState(false);
	const [otpCooldown, setOtpCooldown] = React.useState(0);

	// Fetch banks list
	const { data: banks = [] } = useQuery({
		queryKey: ["banks"],
		queryFn: () => getBanks(),
		enabled: open,
	});

	// Reset form when drawer closes
	React.useEffect(() => {
		if (!open) {
			setFormData(addBankInitial);
			setErrors({});
			setOtpCooldown(0);
		}
	}, [open]);

	const handleChange = (field: keyof AddBankFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleBankSelect = async (bank: Bank) => {
		setFormData((prev) => ({
			...prev,
			bank_name: bank.bank_name,
			bank_code: bank.bank_code,
			account_name: "", // Reset account name when bank changes
		}));
		setErrors((prev) => ({ ...prev, bank_name: "", bank_code: "" }));

		// If account_number is already filled, trigger verification
		if (formData.account_number && formData.account_number.length >= 8) {
			await verifyAccount(bank.bank_code, formData.account_number);
		}
	};

	const verifyAccount = async (bankCode: string, accountNumber: string) => {
		if (!bankCode || !accountNumber || accountNumber.length < 8) return;

		setIsVerifying(true);
		try {
			const result = await verifyBankAccount({
				bank_code: bankCode,
				account_number: accountNumber,
			});
			setFormData((prev) => ({ ...prev, account_name: result.name }));
		} catch (error: any) {
			setErrors((prev) => ({
				...prev,
				account_number: error?.message || "Failed to verify account",
			}));
		} finally {
			setIsVerifying(false);
		}
	};

	// Auto-verify when account_number changes and bank is selected
	React.useEffect(() => {
		if (formData.bank_code && formData.account_number.length >= 8) {
			const timer = setTimeout(() => {
				verifyAccount(formData.bank_code, formData.account_number);
			}, 500); // Debounce
			return () => clearTimeout(timer);
		}
	}, [formData.account_number, formData.bank_code]);

	const handleRequestOTP = async () => {
		if (!formData.bank_name || !formData.account_number || !formData.account_name) {
			setErrors({
				bank_name: !formData.bank_name ? "Bank name is required" : "",
				account_number: !formData.account_number ? "Account number is required" : "",
				account_name: !formData.account_name ? "Account name is required" : "",
			});
			return;
		}

		setIsRequestingOTP(true);
		try {
			await requestBankOTP({
				bank_name: formData.bank_name,
				account_number: formData.account_number,
				account_name: formData.account_name,
			});
			toast.success("OTP sent successfully");

			// Start 30s cooldown
			setOtpCooldown(30);
			const interval = setInterval(() => {
				setOtpCooldown((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} catch (error: any) {
			toast.error(error?.message || "Failed to send OTP");
		} finally {
			setIsRequestingOTP(false);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setErrors({});

		try {
			const formValues = addBankSchema.parse(formData);

			await addBankAccount({
				bank_name: formValues.bank_name,
				account_number: formValues.account_number,
				account_name: formValues.account_name,
				otp: formValues.otp,
			});

			toast.success("Bank account added successfully");
			invalidateQuery(["finance-dashboard"]);
			onClose();
		} catch (error) {
			if (error instanceof ZodError) {
				setErrors(formatZodErrors(error));
				toast.error("Please fix the form errors");
			} else {
				const errMsg = (error as any)?.message || "Failed to add bank account";
				toast.error(errMsg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		formData,
		errors,
		banks,
		otpCooldown,
		isVerifying,
		isRequestingOTP,
		isLoading,
		handleChange,
		handleBankSelect,
		handleRequestOTP,
		handleSubmit,
	};
}
