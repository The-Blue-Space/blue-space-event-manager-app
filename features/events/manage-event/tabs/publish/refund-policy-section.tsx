import { DollarSign } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/app/form-input";
import { PublishEventFormData } from "./schema";

type RefundPolicySectionProps = {
	formData: PublishEventFormData;
	errors: Record<string, string>;
	updateForm: (field: keyof PublishEventFormData, value: any) => void;
};

export default function RefundPolicySection({
	formData,
	errors,
	updateForm,
}: RefundPolicySectionProps) {
	const allowsRefunds = formData.refund_policy_type !== "no-refund";

	const handleRefundPolicyChange = (value: string) => {
		if (value === "allow") {
			updateForm("refund_policy_type", "partial-refund");
			if (!formData.refund_policy_days) {
				updateForm("refund_policy_days", 7); // Default to 7 days
			}
		} else {
			updateForm("refund_policy_type", "no-refund");
			updateForm("refund_policy_days", null);
		}
	};

	return (
		<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
			<div className="flex items-center gap-2">
				<DollarSign className="w-4 h-4 text-accent-500" />
				<h3 className="body-2 font-semibold text-neutral-900">Set your refund policy</h3>
			</div>

			<RadioGroup
				value={allowsRefunds ? "allow" : "no-refund"}
				onValueChange={handleRefundPolicyChange}
				className="space-y-3"
			>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="allow" id="refund-allow" />
					<Label htmlFor="refund-allow" className="body-3 text-neutral-700 cursor-pointer">
						Allow refunds
					</Label>
				</div>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="no-refund" id="refund-no" />
					<Label htmlFor="refund-no" className="body-3 text-neutral-700 cursor-pointer">
						No refunds
					</Label>
				</div>
			</RadioGroup>

			{allowsRefunds && (
				<div className="ml-6 space-y-2 pt-2 border-t border-neutral-200">
					<Input
						label="Days before the event"
						type="number"
						min={1}
						max={30}
						value={formData.refund_policy_days?.toString() || ""}
						onChange={(e) => {
							const value = e.target.value ? parseInt(e.target.value) : null;
							updateForm("refund_policy_days", value);
						}}
						errorMessage={errors.refund_policy_days}
						placeholder="Enter days (1-30)"
						required
					/>
					<p className="text-xs text-neutral-500">
						Set how many days (1 to 30) before the event that attendees can request refunds.
					</p>
				</div>
			)}
		</div>
	);
}
