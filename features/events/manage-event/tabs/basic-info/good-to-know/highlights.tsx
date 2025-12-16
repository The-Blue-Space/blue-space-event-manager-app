"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppButton from "@/components/app/app-button";
import { CheckCircle2, Clock, UserCheck, ParkingCircle } from "lucide-react";
import { toast } from "sonner";
import { useEvent } from "../../../context";
import {
	AGE_RESTRICTION_TYPES,
	AGE_RESTRICTIONS,
	AgeRestriction,
	AgeRestrictionType,
	PARKING_TYPES,
	ParkingType,
} from "@/types/event.types";
import capitalize from "@/lib/capitalize";
import { Badge } from "@/components/ui/badge";
import logger from "@/lib/app-logger";

const AGE_RESTRICTION_TYPES_OPTIONS = AGE_RESTRICTION_TYPES.map((type) => ({
	value: type,
	label: capitalize(type.replace("-", " "), "all"),
}));

const AGE_RESTRICTIONS_OPTIONS = AGE_RESTRICTIONS.map((item) => ({
	value: item,
	label: capitalize(item),
}));

const PARKING_OPTIONS = PARKING_TYPES.map((type) => ({
	value: type,
	label: capitalize(type.replace("-", " "), "all"),
}));

export default function Highlights() {
	const { event, updateEvent } = useEvent();
	const [editMode, setEditMode] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		doors_open_value: 10,
		doors_open_unit: "minutes" as "minutes" | "hours",
		age_restriction_type: event?.age_restriction_type || "no-age-restriction",
		age_restriction: event?.age_restriction || "",
		parking_option: event?.parking_type || "no-parking",
	});

	// Update form data when event changes
	useEffect(() => {
		if (event) {
			// Calculate doors_open_value from doors_open_at
			if (event.doors_open_at && event.event_start_time) {
				// Parse full ISO datetime strings as Date objects
				const doorsOpenDate = new Date(event.doors_open_at);
				const eventStartDate = new Date(event.event_start_time);

				// Calculate difference in milliseconds
				const diffInMs = eventStartDate.getTime() - doorsOpenDate.getTime();

				// Convert to minutes
				const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

				logger.log("doorsOpenDate", doorsOpenDate);
				logger.log("eventStartDate", eventStartDate);
				logger.log("diffInMinutes", diffInMinutes);

				// Only proceed if doors open BEFORE event (positive difference)
				if (diffInMinutes > 0) {
					if (diffInMinutes >= 60) {
						setFormData((prev) => ({
							...prev,
							age_restriction_type: event.age_restriction_type || "no-age-restriction",
							age_restriction: event.age_restriction || "",
							parking_option: event.parking_type || "no-parking",
							doors_open_value: Math.floor(diffInMinutes / 60),
							doors_open_unit: "hours",
						}));
					} else {
						setFormData((prev) => ({
							...prev,
							age_restriction_type: event.age_restriction_type || "no-age-restriction",
							age_restriction: event.age_restriction || "",
							parking_option: event.parking_type || "no-parking",
							doors_open_value: diffInMinutes,
							doors_open_unit: "minutes",
						}));
					}
				}
			}

			setFormData((prev) => ({
				...prev,
				age_restriction_type: event.age_restriction_type || "no-age-restriction",
				age_restriction: event.age_restriction || "",
				parking_option: event.parking_type || "no-parking",
			}));
		}
	}, [event]);

	const updateFormData = (key: keyof typeof formData, value: string) => {
		if (key === "age_restriction_type" && value === "age-restricted") {
			setFormData((prev) => ({
				...prev,
				age_restriction: "",
			}));
		}
		setFormData((prev) => ({
			...prev,
			[key]: value as (typeof formData)[keyof typeof formData],
		}));
	};

	// Calculate doors_open_at time
	const calculateDoorsOpenTime = () => {
		if (!formData.doors_open_value) return event?.event_start_time;

		const eventStartTimeISO = event?.event_start_time || new Date().toISOString();

		// Parse the full ISO datetime string
		const eventDateTime = new Date(eventStartTimeISO);

		// Subtract time based on unit
		if (formData.doors_open_unit === "hours") {
			eventDateTime.setHours(eventDateTime.getHours() - formData.doors_open_value);
		} else {
			eventDateTime.setMinutes(eventDateTime.getMinutes() - formData.doors_open_value);
		}

		// Return full ISO string
		return eventDateTime.toISOString();
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const doors_open_at = calculateDoorsOpenTime();

			await updateEvent("server", {
				doors_open_at,
				age_restriction: (formData.age_restriction as AgeRestriction) || null,
				age_restriction_type: formData.age_restriction_type as AgeRestrictionType | null,
				parking_type: formData.parking_option as ParkingType | null,
			});

			setEditMode(false);
			toast.success("Highlights updated successfully");
		} catch (error) {
			toast.error("Failed to update highlights");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDoorsOpenTime = () => {
		if (!event?.doors_open_at) return "Not set";
		const time = new Date(event.doors_open_at);
		return time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
	};

	const getAgeRestrictionLabel = () => {
		return (
			AGE_RESTRICTIONS_OPTIONS.find((opt) => opt.value === event?.age_restriction)?.label ||
			"Not set"
		);
	};

	const getParkingLabel = () => {
		return PARKING_OPTIONS.find((opt) => opt.value === event?.parking_type)?.label || "Not set";
	};

	return (
		<div className="border border-neutral-200 rounded-lg p-5 bg-white">
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
				<h3 className="flex items-center gap-2 text-neutral-800">
					<CheckCircle2 className="w-5 h-5 text-primary-500" />
					<span className="body-2 font-semibold">Highlights</span>
				</h3>
				<AppButton
					variant="outline"
					className="gap-2 rounded-lg"
					onClick={() => setEditMode(!editMode)}
					disabled={isLoading}
				>
					{editMode ? "Cancel" : "Edit highlights"}
				</AppButton>
			</div>

			{editMode ? (
				// Edit Mode - All fields inline
				<div className="space-y-6">
					{/* Check-in Time */}
					<div>
						<Label>What time can attendees check in before the event?</Label>
						<p className="text-xs text-neutral-500 mt-1 mb-2">Time before event starts</p>
						<div className="flex gap-2">
							<Input
								type="number"
								min="1"
								value={formData.doors_open_value}
								onChange={(e) => updateFormData("doors_open_value", e.target.value)}
								className="w-24"
							/>
							<div className="flex gap-1">
								<AppButton
									type="button"
									variant={formData.doors_open_unit === "minutes" ? "primary" : "outline"}
									onClick={() => updateFormData("doors_open_unit", "minutes")}
									className="!min-w-fit shadow-sm"
								>
									Minutes
								</AppButton>
								<AppButton
									type="button"
									variant={formData.doors_open_unit === "hours" ? "primary" : "outline"}
									onClick={() => updateFormData("doors_open_unit", "hours")}
									className="!min-w-fit shadow-sm"
								>
									Hours
								</AppButton>
							</div>
						</div>
					</div>

					{/* Age Restriction */}
					<div>
						<Label>Is there an age restriction?</Label>
						<div className="flex gap-2 mt-2">
							{AGE_RESTRICTION_TYPES_OPTIONS.map((option) => (
								<AppButton
									key={option.value}
									type="button"
									variant={formData.age_restriction_type === option.value ? "primary" : "outline"}
									onClick={() => updateFormData("age_restriction_type", option.value)}
									className="!min-w-fit shadow-sm"
								>
									{option.label}
								</AppButton>
							))}
						</div>

						{formData.age_restriction_type === "age-restricted" && (
							<div className="mt-2">
								<Label>What ages are allowed?</Label>
								<div className="flex gap-2 mt-2">
									{AGE_RESTRICTIONS_OPTIONS.map((option) => (
										<AppButton
											key={option.value}
											type="button"
											variant={formData.age_restriction === option.value ? "primary" : "outline"}
											onClick={() => updateFormData("age_restriction", option.value)}
											className="!min-w-fit shadow-sm"
										>
											{option.label}
										</AppButton>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Parking */}
					<div>
						<Label>Is there parking at your venue?</Label>
						<div className="flex gap-2 mt-2">
							{PARKING_OPTIONS.map((option) => (
								<AppButton
									key={option.value}
									type="button"
									variant={formData.parking_option === option.value ? "primary" : "outline"}
									onClick={() => updateFormData("parking_option", option.value)}
									className="shadow-sm"
								>
									{option.label}
								</AppButton>
							))}
						</div>
					</div>

					{/* Save Button */}
					<div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
						<AppButton variant="outline" onClick={() => setEditMode(false)} disabled={isLoading}>
							Cancel
						</AppButton>
						<AppButton variant="primary" onClick={handleSave} isLoading={isLoading}>
							Save Changes
						</AppButton>
					</div>
				</div>
			) : (
				// View Mode - Display highlights
				<div className="flex flex-wrap gap-6">
					<div className="flex items-center gap-3">
						<Badge variant="outline" className="p-2 rounded-lg">
							<UserCheck className="w-5 h-5 text-primary-500" />
						</Badge>
						<div>
							<p className="text-xs text-neutral-500">Age Restriction</p>
							<p className="body-2 font-medium text-neutral-900">{getAgeRestrictionLabel()}</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Badge variant="outline" className="p-2 rounded-lg">
							<Clock className="w-5 h-5 text-primary-500" />
						</Badge>
						<div>
							<p className="text-xs text-neutral-500">Check-in Starts</p>
							<p className="body-2 font-medium text-neutral-900">{formatDoorsOpenTime()}</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Badge variant="outline" className="p-2 rounded-lg">
							<ParkingCircle className="w-5 h-5 text-primary-500" />
						</Badge>
						<div>
							<p className="text-xs text-neutral-500">Parking</p>
							<p className="body-2 font-medium text-neutral-900">{getParkingLabel()}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
