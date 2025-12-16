import { Settings, RefreshCw, Download, Image as ImageIcon, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SelectBox from "@/components/app/form-input/select-box";
import { Input } from "@/components/app/form-input";
import AppButton from "@/components/app/app-button";
import AppHoverCard from "@/components/app/app-hover-card";
import AppCheckbox from "@/components/app/app-checkbox";
import useEventSettings from "./use-event-settings";
import { REFUND_POLICY_TYPES } from "@/types/event.types";

const REFUND_POLICY_INFO = {
	"no-refund": {
		title: "No Refund",
		description: "Tickets are non-refundable once purchased",
	},
	"partial-refund": {
		title: "Partial Refund",
		description: "Partial refund available within specified days before event",
	},
	"full-refund": {
		title: "Full Refund",
		description: "Full refund available within specified days before event",
	},
};

export default function EventSettingsTab() {
	const { formData, errors, isLoading, updateForm, submit } = useEventSettings();

	const refundPolicyOptions = REFUND_POLICY_TYPES.map((type) => ({
		value: type,
		title: type
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" "),
	}));

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="space-y-2">
				<h2 className="text-xl font-semibold text-neutral-900">Event Settings</h2>
				<p className="body-3 text-neutral-600">
					Configure default settings for all your events. These can be overwritten per event when
					creating or managing individual events.
				</p>
			</div>

			{/* Refund Policy Type Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
				<div className="flex items-center gap-2">
					<Settings className="w-4 h-4 text-accent-500" />
					<h3 className="body-2 font-semibold text-neutral-900">Refund Policy</h3>
					<AppHoverCard
						trigger={
							<button type="button" className="p-0.5 hover:bg-neutral-100 rounded">
								<Info className="w-4 h-4 text-neutral-500" />
							</button>
						}
						side="right"
					>
						<div className="min-w-[280px] space-y-3">
							<h4 className="font-semibold text-sm text-neutral-900">Refund Policy Types</h4>
							{REFUND_POLICY_TYPES.map((type) => {
								const info = REFUND_POLICY_INFO[type];
								return (
									<div key={type} className="space-y-1">
										<h5 className="font-semibold text-sm text-neutral-800">{info.title}</h5>
										<p className="text-xs text-neutral-600 leading-relaxed">{info.description}</p>
									</div>
								);
							})}
						</div>
					</AppHoverCard>
				</div>

				<div className="space-y-4">
					<SelectBox
						name="refund_policy_type"
						label="Refund Policy Type"
						placeholder="Select refund policy"
						value={formData.refund_policy_type}
						onchange={(value) => updateForm("refund_policy_type", value)}
						disabled={isLoading}
						options={refundPolicyOptions}
						errorMessage={errors.refund_policy_type}
						required
						floatingLabel={true}
					/>

					{formData.refund_policy_type !== "no-refund" && (
						<div className="space-y-2">
							<Input
								name="refund_policy_days"
								type="number"
								label="Refund Policy Days"
								placeholder="e.g., 7"
								value={formData.refund_policy_days?.toString() ?? ""}
								onChange={(e) => {
									const value = e.target.value;
									updateForm("refund_policy_days", value ? parseInt(value, 10) : null);
								}}
								disabled={isLoading}
								errorMessage={errors.refund_policy_days}
								required
								floatingLabel={true}
							/>
							<p className="text-xs text-neutral-500 ml-1">
								Number of days before the event when refunds are allowed
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Automate Refunds Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
				<div className="flex items-center gap-2">
					<RefreshCw className="w-4 h-4 text-accent-500" />
					<h3 className="body-2 font-semibold text-neutral-900">Automate Refunds</h3>
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
								Automatically approve all refund requests for orders within your refund policy if
								the event balance can cover the request. If the event balance cannot cover the
								request, the refund will require manual approval.
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
							No, I will manually approve all refunds
						</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Album Settings Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
				<div className="flex items-center gap-2">
					<ImageIcon className="w-4 h-4 text-accent-500" />
					<h3 className="body-2 font-semibold text-neutral-900">Album Settings</h3>
				</div>

				<div className="space-y-3">
					<div>
						<AppCheckbox
							id="allow-individual-upload"
							checked={formData.allow_individual_upload}
							onCheckedChange={(checked) => updateForm("allow_individual_upload", checked)}
							label="Allow individual upload"
							labelClassName="font-medium !body-1"
							placement="right"
						/>
						<p className="body-3 -mt-1 text-neutral-700 ml-6">
							Attendees can upload photos to event album
						</p>
					</div>

					<div>
						<AppCheckbox
							id="allow-professional-upload"
							checked={formData.allow_professional_upload}
							onCheckedChange={(checked) => updateForm("allow_professional_upload", checked)}
							label="Allow professional upload"
							labelClassName="font-medium !body-1"
							placement="right"
						/>
						<p className="body-3 -mt-1 text-neutral-700 ml-6">
							Allow professionals to upload to album (e.g., freelance photographers)
						</p>
					</div>
				</div>
			</div>

			{/* Download Settings Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
				<div className="flex items-center gap-2">
					<Download className="w-4 h-4 text-accent-500" />
					<h3 className="body-2 font-semibold text-neutral-900">Download Settings</h3>
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
								Allow attendees to download event media such as photos and videos from the event
								album. This setting applies to all your events by default.
							</p>
						</div>
					</AppHoverCard>
				</div>

				<RadioGroup
					value={formData.enable_downloads ? "yes" : "no"}
					onValueChange={(value) => updateForm("enable_downloads", value === "yes")}
					className="space-y-3"
				>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="yes" id="downloads-yes" />
						<Label htmlFor="downloads-yes" className="body-3 text-neutral-700 cursor-pointer">
							Yes, enable downloads
						</Label>
					</div>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="no" id="downloads-no" />
						<Label htmlFor="downloads-no" className="body-3 text-neutral-700 cursor-pointer">
							No, disable downloads
						</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-2">
				<AppButton
					variant="primary"
					className="rounded-lg px-8"
					onClick={submit}
					isLoading={isLoading}
					disabled={isLoading}
				>
					Save Changes
				</AppButton>
			</div>
		</div>
	);
}
