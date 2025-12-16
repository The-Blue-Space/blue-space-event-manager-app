import { FileText, Tag } from "lucide-react";
import { useEvent } from "../../context";
import SectionWrapper from "../../section-wrapper";
import React, { useState } from "react";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/app/form-input";
import z from "zod";
import { formatZodErrors } from "@/lib/ensure-error";
import { Badge } from "@/components/ui/badge";

const validate = z.object({
	title: z
		.string()
		.min(10, { message: "Title must be at least 10 characters" })
		.max(100, { message: "Title must not exceed 100 characters" }),
	description: z
		.string()
		.min(5, { message: "Description must be at least 5 characters" })
		.max(150, { message: "Description must not exceed 150 characters" }),
	tags: z.string().min(1, { message: "At least one tag is required" }),
});

export default function EventDetailsSection() {
	const { event, updateEvent } = useEvent();
	const [isLoading, setIsLoading] = useState(false);
	const initFormData = {
		title: event?.title || "",
		description: event?.description || "",
		tags: event?.tags || "",
	};
	const [formData, setFormData] = useState(initFormData);
	const [errors, setErrors] = useState<Record<string, string>>({});

	React.useEffect(() => {
		setFormData((prev) => ({
			...prev,
			title: event?.title || "",
			description: event?.description || "",
			tags: event?.tags || "",
		}));
	}, [event]);

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error on change
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleCancel = () => {
		setFormData(initFormData);
		setErrors({});
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			const formValues = validate.parse(formData);

			const payload = {
				title: formValues.title,
				description: formValues.description,
				tags: formValues.tags.split(",").map((tag) => tag.trim()),
			};

			await updateEvent("server", payload);
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors(formatZodErrors(error));
				throw error;
			}
			toast.error("Failed to update event details");
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Parse tags for display
	const tagsList = event?.tags?.map((tag) => tag.trim());

	return (
		<SectionWrapper
			title="Event Details"
			icon={<FileText className="w-5 h-5 text-primary-500" />}
			onSave={handleSave}
			onCancel={handleCancel}
			isLoading={isLoading}
		>
			{(mode) => (
				<>
					{mode === "view" ? (
						<div className="space-y-4">
							{/* Title */}
							<div>
								<label className="body-3 text-neutral-500 mb-1 block">Title:</label>
								<p className="body-2 font-semibold text-neutral-800">{event?.title || "—"}</p>
							</div>

							{/* Description */}
							<div>
								<label className="body-3 text-neutral-500 mb-1 block">Description:</label>
								<p className="body-3 text-neutral-700 leading-relaxed">
									{event?.description || "—"}
								</p>
							</div>

							{/* Tags */}
							<div>
								<label className="body-3 text-neutral-500 mb-2 block">Tags:</label>
								<div className="flex flex-wrap gap-2">
									{tagsList && tagsList.length > 0 ? (
										tagsList.map((tag, index) => (
											<Badge key={index} variant="outline" className="gap-1">
												<Tag className="w-3 h-3" />
												<span className="body-3 capitalize">{tag}</span>
											</Badge>
										))
									) : (
										<span className="text-neutral-500 text-xs">No tags</span>
									)}
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{/* Title Input */}
							<Input
								name="title"
								type="text"
								label="Event Title"
								placeholder="e.g., Summer Music Festival 2025"
								value={formData.title}
								onChange={(e) => handleChange("title", e.target.value)}
								disabled={isLoading}
								errorMessage={errors.title}
								required
							/>
							<p className="text-xs text-neutral-500 -mt-2">10-100 characters</p>

							{/* Description Textarea */}
							<div>
								<Textarea
									name="description"
									label="Event Description"
									placeholder="Brief description of your event"
									value={formData.description}
									onChange={(e) => handleChange("description", e.target.value)}
									disabled={isLoading}
									errorMessage={errors.description}
									rows={4}
									required
								/>
								<p className="text-xs text-neutral-500 mt-1">5-150 characters</p>
							</div>

							{/* Tags Input */}
							<div>
								<Input
									name="tags"
									type="text"
									label="Tags"
									placeholder="e.g., music, festival, outdoor"
									value={formData.tags}
									onChange={(e) => handleChange("tags", e.target.value)}
									disabled={isLoading}
									errorMessage={errors.tags}
									required
								/>
								<p className="text-xs text-neutral-500 mt-1">Separate multiple tags with commas</p>
							</div>
						</div>
					)}
				</>
			)}
		</SectionWrapper>
	);
}
