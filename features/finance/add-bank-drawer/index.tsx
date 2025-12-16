"use client";

import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import { Input, SelectBox } from "@/components/app/form-input";
import useAddBank from "./use-add-bank";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";

type AddBankDrawerProps = {
	open: boolean;
	onClose: () => void;
};

export default function AddBankDrawer({ open, onClose }: AddBankDrawerProps) {
	const {
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
	} = useAddBank({ open, onClose });

	return (
		<AppDrawer
			title="Add Bank Account"
			open={open}
			handleChange={onClose}
			direction="right"
			showLogo={false}
			className="hide-scrollbar"
			footer={
				<div className="flex justify-between border-t border-neutral-200 pt-2">
					<AppButton variant="outline" onClick={onClose}>
						Cancel
					</AppButton>
					<AppButton variant="primary" onClick={handleSubmit} isLoading={isLoading}>
						Add Bank
					</AppButton>
				</div>
			}
		>
			<div className="p-4 space-y-6">
				{/* Select Bank */}
				<SelectBox
					name="bank_code"
					label="Select Bank"
					placeholder="Choose your bank"
					value={formData.bank_code || ""}
					onchange={(e) => {
						const bank = banks.find((b) => b.bank_code === e);
						if (bank) handleBankSelect(bank);
					}}
					errorMessage={errors.bank_name || errors.bank_code}
					required
					options={banks.map((bank) => ({
						title: bank.bank_name,
						value: bank.bank_code,
					}))}
				/>
				{/* Account Number */}
				<Input
					name="account_number"
					label="Account Number"
					type="text"
					value={formData.account_number || ""}
					onChange={(e) => handleChange("account_number", e.target.value)}
					placeholder="Enter account number"
					errorMessage={errors.account_number}
					disabled={isLoading || !formData.bank_code}
					required
				/>

				{/* Account Name (Auto-filled) */}
				<div>
					<label className="body-2 font-medium text-neutral-900 mb-2 block">
						Account Name<span className="text-error-500">*</span>
					</label>
					{isVerifying ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<Input
							name="account_name"
							type="text"
							value={formData.account_name || ""}
							onChange={() => {}} // Disabled
							placeholder="Account name will be auto-filled"
							disabled
							errorMessage={errors.account_name}
						/>
					)}
				</div>

				{/* Verification Note */}
				<div className="bg-primary-100/10 border border-primary-200 rounded-lg p-3">
					<div className="flex items-start gap-2">
						<Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
						<p className="body-3 text-primary-700">
							We&apos;ll verify your account details. An OTP will be sent to confirm your bank
							account ownership.
						</p>
					</div>
				</div>

				{/* OTP Section */}
				<div className="space-y-3">
					<div className="flex items-end gap-2">
						<div className="flex-1">
							<Input
								name="otp"
								label="Enter OTP"
								type="text"
								value={formData.otp || ""}
								onChange={(e) => handleChange("otp", e.target.value.replace(/\D/g, ""))}
								placeholder="Enter OTP code"
								maxLength={6}
								errorMessage={errors.otp}
								disabled={isLoading}
								required
							/>
						</div>
						<AppButton
							variant="outline"
							onClick={handleRequestOTP}
							disabled={otpCooldown > 0 || isRequestingOTP || !formData.account_name}
							isLoading={isRequestingOTP}
							className="mb-0"
						>
							{otpCooldown > 0 ? `${otpCooldown}s` : "Request OTP"}
						</AppButton>
					</div>
				</div>
			</div>
		</AppDrawer>
	);
}
