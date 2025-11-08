"use client";

import React from "react";
import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import { Textarea } from "@/components/app/form-input";
import { disputeSchema, disputeInitial, DisputeFormData } from "./schema";
import { formatZodErrors } from "@/lib/ensure-error";
import disputePayout from "@/services/finance/dispute-payout";
import { Payout } from "@/types/finance.types";
import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";
import { getDateAndTime } from "@/lib/format-date";
import { toast } from "sonner";
import { ZodError } from "zod";
import invalidateQuery from "@/lib/invalidate-query";

type DisputeDrawerProps = {
	open: boolean;
	onClose: () => void;
	payout: Payout | null;
};

export default function DisputeDrawer({ open, onClose, payout }: DisputeDrawerProps) {
	const [formData, setFormData] = React.useState<DisputeFormData>(disputeInitial);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = React.useState(false);
	const { activeCurrency, currencies } = useAppSelector("init");

	// Reset form when drawer opens/closes
	React.useEffect(() => {
		if (!open) {
			setFormData(disputeInitial);
			setErrors({});
		}
	}, [open]);

	const handleChange = (value: string) => {
		setFormData({ dispute_reason: value });
		if (errors.dispute_reason) {
			setErrors({ dispute_reason: "" });
		}
	};

	const handleSubmit = async () => {
		if (!payout) return;

		setIsLoading(true);
		setErrors({});

		try {
			const formValues = disputeSchema.parse(formData);

			await disputePayout({
				payout_id: payout.id,
				dispute_reason: formValues.dispute_reason,
			});

			toast.success("Dispute submitted successfully");
			invalidateQuery(["payout-history"]);
			onClose();
		} catch (error) {
			if (error instanceof ZodError) {
				setErrors(formatZodErrors(error));
				toast.error("Please fix the form errors");
			} else {
				const errMsg = (error as any)?.message || "Failed to submit dispute";
				toast.error(errMsg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (!payout) return null;

	const currency =
		currencies.find((c) => c.id === payout.currency_id)?.symbol || activeCurrency.symbol;

	return (
		<AppDrawer
			title="Dispute Payout"
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
						Submit Dispute
					</AppButton>
				</div>
			}
		>
			<div className="p-4 space-y-6">
				{/* Payout Details (Read-only) */}
				<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
					<h3 className="body-1 font-semibold text-neutral-900">Payout Details</h3>
					<div className="space-y-2">
						<div>
							<p className="text-xs text-neutral-500">Event Name</p>
							<p className="body-2 text-neutral-900">{payout.event_name}</p>
						</div>
						<div>
							<p className="text-xs text-neutral-500">Total Revenue</p>
							<p className="body-2 text-neutral-900">
								{currency} {amountSeparator(payout.total_revenue)}
							</p>
						</div>
						<div>
							<p className="text-xs text-neutral-500">Collection Fee</p>
							<p className="body-2 text-neutral-900">
								{currency} {amountSeparator(payout.collection_fee)}
							</p>
						</div>
						<div>
							<p className="text-xs text-neutral-500">Payout Amount</p>
							<p className="body-2 text-neutral-900 font-semibold">
								{currency} {amountSeparator(payout.payout_amount)}
							</p>
						</div>
						<div>
							<p className="text-xs text-neutral-500">Payment Reference</p>
							<p className="body-2 text-neutral-900 font-mono">
								{payout.payment_reference || "N/A"}
							</p>
						</div>
						<div>
							<p className="text-xs text-neutral-500">Paid Date</p>
							<p className="body-2 text-neutral-900">
								{payout.paid_at ? getDateAndTime(payout.paid_at).date : "N/A"}
							</p>
						</div>
					</div>
				</div>

				{/* Dispute Reason */}
				<div>
					<Textarea
						name="dispute_reason"
						label="Dispute Reason"
						placeholder="Please explain why you are disputing this payout..."
						value={formData.dispute_reason}
						onChange={(e) => handleChange(e.target.value)}
						disabled={isLoading}
						errorMessage={errors.dispute_reason}
						rows={5}
						required
					/>
					<p className="text-xs text-neutral-500 mt-1">
						{formData.dispute_reason.length}/500 characters
					</p>
				</div>
			</div>
		</AppDrawer>
	);
}
