"use client";

import { Refund } from "@/types/refund.types";
import useAppSelector from "@/store/hooks";
import { amountSeparator } from "@/lib/amount-separator";

type Props = {
	refund: Refund;
};

export default function AmountDetails({ refund }: Props) {
	const { activeCurrency } = useAppSelector("init");
	const currency = activeCurrency.symbol;

	return (
		<div className="space-y-4">
			<h3 className="body-1 font-semibold text-neutral-900">Amount Details</h3>

			<div className="space-y-3 bg-neutral-50 rounded-lg p-4">
				<div className="flex justify-between items-center">
					<span className="body-2 text-neutral-600">Original Amount</span>
					<span className="body-2 font-medium text-neutral-900">
						{currency} {amountSeparator(refund.original_amount / 100)}
					</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="body-2 text-neutral-600">Refund Amount</span>
					<span className="body-2 font-medium text-neutral-900">
						{currency} {amountSeparator(refund.refund_amount / 100)}
					</span>
				</div>

				{refund.refund_fee > 0 && (
					<div className="flex justify-between items-center">
						<span className="body-2 text-neutral-600">Refund Fee</span>
						<span className="body-2 font-medium text-error-600">
							-{currency} {amountSeparator(refund.refund_fee / 100)}
						</span>
					</div>
				)}

				<div className="border-t border-neutral-200 pt-3">
					<div className="flex justify-between items-center">
						<span className="body-2 font-semibold text-neutral-900">Net Refund</span>
						<span className="body-1 font-bold text-primary-600">
							{currency} {amountSeparator(refund.net_refund_amount / 100)}
						</span>
					</div>
				</div>

				{refund.refund_policy_type && (
					<div className="border-t border-neutral-200 pt-3">
						<div className="flex justify-between items-center">
							<span className="body-3 text-neutral-500">Refund Policy</span>
							<span className="body-3 font-medium text-neutral-700 capitalize">
								{refund.refund_policy_type.replace(/-/g, " ")}
								{refund.refund_policy_percentage && ` (${refund.refund_policy_percentage}%)`}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
