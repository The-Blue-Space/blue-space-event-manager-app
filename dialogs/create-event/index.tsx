import AppButton from "@/components/app/app-button";
import * as React from "react";
import useCreateEvent from "./use-create-event";
import { ACCESS_TYPE_INFO } from "./data";
import { Input, Textarea } from "@/components/app/form-input";
import SelectBox from "@/components/app/form-input/select-box";
import AppSwitch from "@/components/app/app-switch";
import AppHoverCard from "@/components/app/app-hover-card";
import { InfoIcon } from "lucide-react";
import { ACCESS_TYPES } from "@/types/event.types";
import AppDrawer from "@/components/app/app-drawer";

export default React.memo(function CreateEventDialog() {
	const {
		isLoading,
		eventCategoryOptions,
		formData,
		updateForm,
		submit,
		errors,
		fetchingEventCategories,
		open,
		close,
		locationOptions,
		fetchingLocations,
	} = useCreateEvent();

	return (
		<AppDrawer
			title="Create New Event"
			open={open}
			direction="bottom"
			handleChange={close}
			className="hide-scrollbar"
			headerClassName="mb-5 py-2"
			showLogo={false}
		>
			<form className="flex flex-col gap-4 w-full max-w-xl mx-auto p-4 rounded-lg border">
				<span className="body-2 text-neutral-500">
					Setup by filling out the basic details below
				</span>
				{/* Event Title */}
				<Input
					name="title"
					type="text"
					label="Event Title"
					floatingLabel={true}
					placeholder="e.g., Summer Music Festival 2025"
					value={formData.title}
					onChange={(e) => updateForm("title", e.target.value)}
					disabled={isLoading}
					errorMessage={errors.title}
					required
				/>

				{/* Event Description */}
				<Textarea
					name="description"
					label="Event Description"
					placeholder="Brief description of your event (5-150 characters)"
					value={formData.description}
					onChange={(e) => updateForm("description", e.target.value)}
					disabled={isLoading}
					errorMessage={errors.description}
					floatingLabel={true}
					required
				/>

				{/* Category & Location */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<SelectBox
						name="event_category_id"
						label="Category"
						placeholder="Select Category"
						value={formData.event_category_id}
						onchange={(value) => updateForm("event_category_id", value)}
						disabled={isLoading || fetchingEventCategories}
						options={eventCategoryOptions}
						errorMessage={errors.event_category_id}
						required
						floatingLabel={true}
					/>
					<SelectBox
						name="location_id"
						label="Location"
						placeholder="Select Location"
						value={formData.location_id}
						onchange={(value) => updateForm("location_id", value)}
						disabled={isLoading || fetchingLocations}
						options={locationOptions}
						errorMessage={errors.location_id}
						required
						floatingLabel={true}
					/>
				</div>

				{/* Tags */}
				<div>
					<Input
						name="tags"
						type="text"
						label="Tags"
						placeholder="e.g., music, festival, outdoor"
						value={formData.tags}
						onChange={(e) => updateForm("tags", e.target.value)}
						disabled={isLoading}
						errorMessage={errors.tags}
						required
						floatingLabel={true}
					/>
					<p className="text-xs text-neutral-500 mt-1">Separate multiple tags with commas</p>
				</div>

				{/* Access Type with Hover Card */}
				<div className="flex items-star gap-2 w-full">
					<div className="flex-1">
						<SelectBox
							name="access_type"
							label="Access Type"
							placeholder="Select Access Type"
							value={formData.access_type}
							onchange={(value) => updateForm("access_type", value)}
							disabled={isLoading}
							options={ACCESS_TYPES.map((type) => ({
								title: type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
								value: type,
							}))}
							errorMessage={errors.access_type}
							required
							floatingLabel={true}
						/>
					</div>
					<AppHoverCard
						trigger={
							<div className="">
								<InfoIcon className="w-5 h-5 text-neutral-400 cursor-help hover:text-primary-500 transition-colors" />
							</div>
						}
						contentClassName="w-96 p-0 overflow-hidden"
						side="right"
						delay={200}
					>
						<div className="space-y-3 p-4">
							<h4 className="font-semibold text-sm text-neutral-900 mb-3">Access Types</h4>
							{ACCESS_TYPES.map((type) => {
								const info = ACCESS_TYPE_INFO[type as keyof typeof ACCESS_TYPE_INFO];
								return (
									<div
										key={type}
										className="flex items-start gap-3 p-2 rounded-lg bg-neutral-50 border border-neutral-100"
									>
										<span className="text-2xl flex-shrink-0">{info?.icon || "📌"}</span>
										<div className="flex-1 space-y-1">
											<h5 className="font-semibold text-sm text-neutral-800">{info?.title}</h5>
											<p className="text-xs text-neutral-600 leading-relaxed">
												{info?.description}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</AppHoverCard>
				</div>

				{/* Event Visibility Switch */}
				<div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
					<div className="flex-1">
						<label className="body-3 text-primary-500 block mb-1">Event Visibility</label>
						<p className="text-xs text-neutral-600">
							{formData.is_private
								? "Private - Hidden from public listings, invite-only"
								: "Public - Visible to everyone and listed publicly"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<span className="body-3 text-primary-500">
							{formData.is_private ? "Private" : "Public"}
						</span>
						<AppSwitch
							checked={formData.is_private}
							onCheckedChange={(checked) => updateForm("is_private", checked)}
							disabled={isLoading}
						/>
					</div>
				</div>
				<div className="flex gap-3 justify-end items-center w-full pt-2">
					<AppButton variant="outline" className="rounded-lg" onClick={close} disabled={isLoading}>
						Cancel
					</AppButton>
					<AppButton
						variant="primary"
						className="rounded-lg"
						onClick={submit}
						isLoading={isLoading}
					>
						Create Event
					</AppButton>
				</div>
			</form>
		</AppDrawer>
	);
});
