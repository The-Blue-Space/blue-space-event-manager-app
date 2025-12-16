import { Calendar, Clock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DateInput, TimeInput } from "@/components/app/form-input";
import { PublishEventFormData } from "./schema";

type PublishScheduleSectionProps = {
	formData: PublishEventFormData;
	errors: Record<string, string>;
	updateForm: (field: keyof PublishEventFormData, value: any) => void;
};

export default function PublishScheduleSection({
	formData,
	errors,
	updateForm,
}: PublishScheduleSectionProps) {
	return (
		<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
			<div className="flex items-center gap-2">
				<Calendar className="w-4 h-4 text-accent-500" />
				<h3 className="body-2 font-semibold text-neutral-900">Publish event now?</h3>
			</div>

			<RadioGroup
				value={formData.should_schedule ? "schedule" : "publish"}
				onValueChange={(value) => {
					updateForm("should_schedule", value === "schedule");
					if (value === "publish") {
						updateForm("scheduled_date", null);
						updateForm("scheduled_time", null);
					} else {
						// Set default to tomorrow at 9 AM
						const tomorrow = new Date();
						tomorrow.setDate(tomorrow.getDate() + 1);
						tomorrow.setHours(9, 0, 0, 0);
						updateForm("scheduled_date", tomorrow.toISOString());
						updateForm("scheduled_time", "09:00");
					}
				}}
				className="space-y-3"
			>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="publish" id="publish-now" />
					<Label htmlFor="publish-now" className="body-3 text-neutral-700 cursor-pointer">
						Yes, publish
					</Label>
				</div>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="schedule" id="publish-schedule" />
					<Label htmlFor="publish-schedule" className="body-3 text-neutral-700 cursor-pointer">
						No, Schedule
					</Label>
				</div>
			</RadioGroup>

			{formData.should_schedule && (
				<div className="ml-6 space-y-3 pt-2 border-t border-neutral-200">
					<DateInput
						label="Publish date"
						value={formData.scheduled_date ? new Date(formData.scheduled_date) : undefined}
						onChange={(date) => {
							if (date) {
								// Store only the date part (YYYY-MM-DD)
								const dateStr = date.toISOString().split("T")[0];
								updateForm("scheduled_date", dateStr);
							} else {
								updateForm("scheduled_date", null);
							}
						}}
						errorMessage={errors.scheduled_date}
						required
						minDate={new Date()}
					/>
					<TimeInput
						label="Time"
						value={formData.scheduled_time || ""}
						onChange={(time) => updateForm("scheduled_time", time)}
						errorMessage={errors.scheduled_time}
						required
						modal
					/>
				</div>
			)}
		</div>
	);
}
