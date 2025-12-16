"use client";

import AppButton from "@/components/app/app-button";
import AppDialog from "@/components/app/app-dialog";
import { BankDetails } from "@/types/finance.types";
import { Landmark } from "lucide-react";
import * as React from "react";

type DeleteBankDialogProps = {
	open: boolean;
	bank: BankDetails | null;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
};

export default function DeleteBankDialog({
	open,
	bank,
	onClose,
	onConfirm,
	isLoading,
}: DeleteBankDialogProps) {
	if (!bank) return null;

	return (
		<AppDialog
			open={open}
			onClose={onClose}
			showCloseButton={false}
			footer={
				<div className="flex justify-between gap-4 w-full [&_button]:flex-1">
					<AppButton variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</AppButton>
					<AppButton variant="primary" onClick={onConfirm} isLoading={isLoading}>
						Remove
					</AppButton>
				</div>
			}
		>
			<div className="flex flex-col gap-5 py-3 text-center max-w-md mx-auto">
				<h2 className="heading-6 font-bold text-neutral-900">Remove Account</h2>
				<p className="body-2 text-neutral-600">Are you sure you want to remove this account?</p>

				{/* Bank Details Card */}
				<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 flex items-center gap-3">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
							<Landmark className="w-5 h-5 text-primary-600" />
						</div>
					</div>
					<div className="flex-1 text-left">
						<p className="body-2 font-semibold text-neutral-900">{bank.account_name}</p>
						<p className="body-3 text-neutral-500 font-mono">{bank.account_number}</p>
						<p className="body-3 text-neutral-600">{bank.bank_name}</p>
					</div>
				</div>
			</div>
		</AppDialog>
	);
}
