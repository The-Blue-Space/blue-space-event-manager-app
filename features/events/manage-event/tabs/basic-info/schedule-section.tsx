import { Calendar, Clock, X, ArrowRight } from "lucide-react";
import { useEvent } from "../../context";
import SectionWrapper from "../../section-wrapper";
import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { getDateAndTime } from "@/lib/format-date";
import { Input } from "@/components/ui/input";
import z from "zod";
import { formatZodErrors } from "@/lib/ensure-error";
import { DateInput } from "@/components/app/form-input";

/**
 * Combines a date ISO string with a time string to create a full ISO datetime string
 * @param dateISO - ISO date string (e.g., "2025-12-02T00:00:00+01:00")
 * @param timeString - Time string (e.g., "14:30:00")
 * @returns ISO datetime string preserving original timezone (e.g., "2025-12-02T14:30:00+01:00")
 */
const combineDateTime = (dateISO: string, timeString: string): string => {
	if (!dateISO || !timeString) return "";
	
	try {
		// Extract date part (YYYY-MM-DD) from ISO string
		const datePart = dateISO.split("T")[0];
		
		// Extract timezone from original date (e.g., "+01:00", "Z", etc.)
		const timezoneMatch = dateISO.match(/([+-]\d{2}:\d{2}|Z)$/);
		const timezone = timezoneMatch ? timezoneMatch[0] : "Z";
		
		// Combine date, time, and preserve original timezone
		return `${datePart}T${timeString}${timezone}`;
	} catch (error) {
		console.error("Error combining date and time:", error);
		return "";
	}
};

/**
 * Extracts time portion from an ISO string or returns the string as-is if it's already a time
 * @param isoString - ISO datetime string or plain time string
 * @returns Time string in "HH:MM:SS" format
 */
const extractTimeFromISO = (isoString?: string | null): string => {
	if (!isoString) return "";
	
	try {
		// If it contains 'T', it's an ISO datetime string
		if (isoString.includes("T")) {
			// Extract time part after 'T' and before 'Z' or timezone offset
			const timePart = isoString.split("T")[1];
			// Remove timezone info (Z, +XX:XX, etc.)
			return timePart.split(/[Z+-]/)[0];
		}
		
		// If it's already a time string, return as-is
		return isoString;
	} catch (error) {
		console.error("Error extracting time from ISO:", error);
		return isoString || "";
	}
};

const validate = z
	.object({
		start_date: z.string().min(1, { message: "Start date is required" }),
		start_time: z.string().min(1, { message: "Start time is required" }),
		end_date: z.string().optional().or(z.literal("")),
		end_time: z.string().optional().or(z.literal("")),
	})
	.refine(
		(data) => {
			// Validate end > start only if end date exists
			if (data.end_date && data.end_time && data.start_date && data.start_time) {
				const start = new Date(`${data.start_date.split("T")[0]}T${data.start_time}`);
				const end = new Date(`${data.end_date.split("T")[0]}T${data.end_time}`);
				return end > start;
			}
			return true;
		},
		{
			message: "End date/time must be after start date/time",
			path: ["end_date"],
		}
	);

export default function ScheduleSection() {
	const { event, updateEvent } = useEvent();
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Use useMemo to compute initial form data
	const initialFormData = useMemo(
		() => ({
			start_date: event?.event_start_date || new Date().toISOString(),
			start_time: extractTimeFromISO(event?.event_start_time || "00:00:00"),
			end_date: event?.event_end_date || "",
			end_time: extractTimeFromISO(event?.event_end_time || ""),
		}),
		[event]
	);

	const [formData, setFormData] = useState(initialFormData);

	// Update form data when event changes
	useEffect(() => {
		setFormData(initialFormData);
	}, [initialFormData]);

	const handleChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleCancel = () => {
		setFormData(initialFormData);
		setErrors({});
	};

	const handleClearEndDate = () => {
		setFormData((prev) => ({
			...prev,
			end_date: "",
			end_time: "",
		}));
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors.end_date;
			delete newErrors.end_time;
			return newErrors;
		});
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const formValues = validate.parse(formData);

			const payload = {
				event_start_date: formValues.start_date,
				event_start_time: combineDateTime(formValues.start_date, formValues.start_time),
				event_end_date: formValues.end_date || null,
				event_end_time:
					formValues.end_date && formValues.end_time
						? combineDateTime(formValues.end_date, formValues.end_time)
						: null,
			};

			await updateEvent("server", payload);
			toast.success("Schedule updated successfully");
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors(formatZodErrors(error));
				throw error;
			}
			toast.error("Failed to update schedule");
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Format display dates
	const formatDisplayDate = (date?: string | null) => {
		if (!date) return "—";
		try {
			return getDateAndTime(date, {
				dateOptions: { month: "long", day: "numeric", year: "numeric" },
			}).date;
		} catch {
			return date;
		}
	};

	const formatDisplayTime = (time?: string | null) => {
		if (!time) return "—";
		try {
			// Extract time from ISO string or use as-is if plain time
			const timeString = extractTimeFromISO(time);
			const [hours, minutes] = timeString.split(":");
			const hour = parseInt(hours);
			const ampm = hour >= 12 ? "PM" : "AM";
			const displayHour = hour % 12 || 12;
			return `${displayHour}:${minutes} ${ampm}`;
		} catch {
			return time;
		}
	};

	return (
		<SectionWrapper
			title="Date & Time"
			icon={<Calendar className="w-5 h-5 text-primary-500" />}
			onSave={handleSave}
			onCancel={handleCancel}
			isLoading={isLoading}
		>
			{(mode) => (
				<>
					{mode === "view" ? (
						<div className="flex items-center gap-3">
							<label className="body-2 text-neutral-500">Start:</label>
							{/* Start Date/Time */}
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-neutral-400" />
								<span className="body-2 text-primary-500">
									{formatDisplayDate(event?.event_start_date)}
								</span>
								<Clock className="w-4 h-4 text-neutral-400 ml-2" />
								<span className="body-2 text-primary-500">
									{formatDisplayTime(event?.event_start_time)}
								</span>
							</div>

							{/* End Date/Time (only if set) */}
							{event?.event_end_date && event?.event_end_time && (
								<>
									<ArrowRight className="w-4 h-4 text-neutral-400" />
									<label className="body-2 text-neutral-500">End:</label>

									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-neutral-400" />
										<span className="body-2 text-primary-500">
											{formatDisplayDate(event?.event_end_date)}
										</span>
										<Clock className="w-4 h-4 text-neutral-400 ml-2" />
										<span className="body-2 text-primary-500">
											{formatDisplayTime(event?.event_end_time)}
										</span>
									</div>
								</>
							)}
						</div>
					) : (
						<div className="flex items-start gap-5">
							{/* Start Date & Time */}
							<div>
								<label className="body-3 font-medium text-neutral-700 mb-3 block">
									Start Date & Time <span className="text-red-500">*</span>
								</label>
								<div className="flex gap-3">
									<div>
										<DateInput
											value={new Date(formData.start_date)}
											onChange={(date) => handleChange("start_date", date.toISOString())}
											disabled={isLoading}
										/>
										{errors.start_date && (
											<p className="text-xs text-red-500 mt-1">{errors.start_date}</p>
										)}
									</div>
									<div>
										<Input
											type="time"
											id="start-time-picker"
											step="1"
											value={formData.start_time}
											onChange={(e) => handleChange("start_time", e.target.value)}
											className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
										/>
										{errors.start_time && (
											<p className="text-xs text-red-500 mt-1">{errors.start_time}</p>
										)}
									</div>
								</div>
							</div>

							{/* End Date & Time (Optional) */}
							<div>
								<label className="body-3 font-medium text-neutral-700 mb-3 block">
									End Date & Time{" "}
									<span className="text-xs text-neutral-500 font-normal">(Optional)</span>
								</label>
								<div className="flex gap-3">
									<div>
										<DateInput
											value={formData.end_date ? new Date(formData.end_date) : undefined}
											onChange={(date) => handleChange("end_date", date.toISOString())}
											disabled={isLoading}
										/>
										{errors.end_date && (
											<p className="text-xs text-red-500 mt-1">{errors.end_date}</p>
										)}
									</div>
									<div>
										<Input
											type="time"
											id="end-time-picker"
											step="1"
											value={formData.end_time}
											onChange={(e) => handleChange("end_time", e.target.value)}
											disabled={isLoading}
											className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
										/>
										{errors.end_time && (
											<p className="text-xs text-red-500 mt-1">{errors.end_time}</p>
										)}
									</div>
									{formData.end_date && (
										<button
											onClick={handleClearEndDate}
											disabled={isLoading}
											className="p-2 hover:bg-red-50 rounded-lg transition-colors"
											type="button"
											title="Clear end date"
										>
											<X className="w-4 h-4 text-red-500" />
										</button>
									)}
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</SectionWrapper>
	);
}
