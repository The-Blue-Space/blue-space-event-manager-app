import { Info, RefreshCw } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import AppHoverCard from "@/components/app/app-hover-card";
import { PublishEventFormData } from "./schema";

type AutomateRefundsSectionProps = {
	formData: PublishEventFormData;
	updateForm: (field: keyof PublishEventFormData, value: any) => void;
};

export default function AutomateRefundsSection({
	formData,
	updateForm,
}: AutomateRefundsSectionProps) {
	return (
		<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
			<div className="flex items-center gap-2">
				<RefreshCw className="w-4 h-4 text-accent-500" />
				<h3 className="body-2 font-semibold text-neutral-900">Automate refunds</h3>
				<AppHoverCard
					trigger={
						<button type="button" className="p-0.5 hover:bg-neutral-100 rounded">
							<Info className="w-4 h-4 text-neutral-500" />
						</button>
					}
					side="right"
				>
					<div className="min-w-[280px]">
						<p className="body-3 text-neutral-700">
							Automatically approve all refund requests for orders within your refund policy if the
							event balance can cover the request. If the event balance cannot cover the request,
							the refund will require manual approval.
						</p>
					</div>
				</AppHoverCard>
			</div>

			<RadioGroup
				value={formData.automate_refunds ? "yes" : "no"}
				onValueChange={(value) => updateForm("automate_refunds", value === "yes")}
				className="space-y-3"
			>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="yes" id="automate-yes" />
					<Label htmlFor="automate-yes" className="body-3 text-neutral-700 cursor-pointer">
						Yes, automate refunds
					</Label>
				</div>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="no" id="automate-no" />
					<Label htmlFor="automate-no" className="body-3 text-neutral-700 cursor-pointer">
						No, I will disburse all refunds
					</Label>
				</div>
			</RadioGroup>
		</div>
	);
}
