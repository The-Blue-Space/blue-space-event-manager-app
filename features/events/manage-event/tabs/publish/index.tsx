"use client";
import { CalendarCheck } from "lucide-react";
import SectionWrapper from "../../section-wrapper";
import TabContainer from "../../tab-container";
import AppButton from "@/components/app/app-button";
import usePublish from "./use-publish";
import EventInformationSection from "./event-information-section";
import TicketListSection from "./ticket-list-section";
import AlbumSettingsSection from "./album-settings-section";
import EventPrivacySection from "./event-privacy-section";
import RefundPolicySection from "./refund-policy-section";
import AutomateRefundsSection from "./automate-refunds-section";
import PublishScheduleSection from "./publish-schedule-section";
import ValidationWarning from "./validation-warning";

export default function PublishTab() {
	const { formData, errors, isLoading, updateForm, submit, validateRequiredFields } = usePublish();

	const validation = validateRequiredFields();
	const buttonDisabled = !validation.isValid || isLoading;

	const handlePublish = async () => {
		await submit();
	};

	return (
		<TabContainer value="publish" className="!max-w-5xl">
			<SectionWrapper
				title="Publish Event"
				icon={<CalendarCheck className="w-5 h-5 text-primary-500" />}
				description="Final touches before publishing your event. Review and configure publishing settings."
				showSaveButton={false}
				showCancelButton={false}
				editComponent={
					<AppButton
						variant="primary"
						onClick={handlePublish}
						disabled={buttonDisabled}
						isLoading={isLoading}
					>
						{formData.should_schedule ? "Schedule" : "Publish"}
					</AppButton>
				}
			>
				{() => (
					<div className="space-y-6">
						{/* Validation Warning */}
						{validation.missingFields.length > 0 && (
							<ValidationWarning missingFields={validation.missingFields} />
						)}

						{/* Two Column Grid Layout */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Left Column */}
							<div className="space-y-6">
								<EventInformationSection />

								<RefundPolicySection formData={formData} errors={errors} updateForm={updateForm} />
								{formData.refund_policy_type !== "no-refund" && (
									<AutomateRefundsSection formData={formData} updateForm={updateForm} />
								)}
								<PublishScheduleSection
									formData={formData}
									errors={errors}
									updateForm={updateForm}
								/>
							</div>

							{/* Right Column */}
							<div className="space-y-6">
								<TicketListSection />
								<AlbumSettingsSection formData={formData} updateForm={updateForm} />
								<EventPrivacySection formData={formData} updateForm={updateForm} />
							</div>
						</div>

						{/* Publish Button (Bottom Center) */}
						<div className="flex justify-end pt-4">
							<AppButton
								variant="primary"
								onClick={handlePublish}
								disabled={buttonDisabled}
								isLoading={isLoading}
								// className="min-w-[200px]"
							>
								{formData.should_schedule ? "Schedule" : "Publish"}
							</AppButton>
						</div>
					</div>
				)}
			</SectionWrapper>
		</TabContainer>
	);
}
