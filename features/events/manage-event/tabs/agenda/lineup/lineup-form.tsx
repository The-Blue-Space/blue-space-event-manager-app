"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { X, FileText, UserPenIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppButton from "@/components/app/app-button";
import { Textarea } from "@/components/app/form-input";
import AppSwitch from "@/components/app/app-switch";
import { EventLineup } from "@/types/event-agenda.types";
// import TimeSelect from "../agenda/time-select";
import TimeSelect from "../time-select";

export type LineupFormRef = {
	validate: () => boolean;
	getFormData: () => {
		artist_name: string;
		artist_image?: File;
		start_time?: string;
		end_time?: string;
		is_headliner: boolean;
		notes?: string;
		socials: string[];
	};
	submit: () => Promise<void>;
};

type LineupFormProps = {
	lineup?: EventLineup;
	onSave: (data: {
		artist_name: string;
		artist_image?: File;
		start_time?: string;
		end_time?: string;
		is_headliner: boolean;
		notes?: string;
		socials: string[];
	}) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
	isInline?: boolean;
	isEdit?: boolean;
};

export default forwardRef<LineupFormRef, LineupFormProps>(function LineupForm(
	{ lineup, onSave, onCancel, isLoading = false, isInline = false, isEdit = false },
	ref
) {
	const initialFormData = {
		artist_name: "",
		start_time: "",
		end_time: "",
		is_headliner: false,
		notes: "",
		socials: [],
	};

	const [formData, setFormData] = useState({
		artist_name: lineup?.artist_name || "",
		start_time: lineup?.start_time || "",
		end_time: lineup?.end_time || "",
		is_headliner: lineup?.is_headliner || false,
		notes: lineup?.notes || "",
		socials: lineup?.socials || [],
	});
	const [errors, setErrors] = useState({
		artist_name: "",
		artist_image_url: "",
	});
	const [artistImage, setArtistImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(lineup?.artist_image_url || null);
	const [showNotes, setShowNotes] = useState(!!lineup?.notes);

	const validate = () => {
		let isValid = true;
		const newErrors = { artist_name: "", artist_image_url: "" };

		if (!formData.artist_name.trim()) {
			newErrors.artist_name = "Artist name is required";
			isValid = false;
		}

		// if (!lineup && !artistImage) {
		// 	newErrors.artist_image_url = "Artist image is required";
		// 	isValid = false;
		// }

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		if (e) {
			e.preventDefault();
		}

		if (!validate()) {
			return;
		}
		try {
			await onSave({
				artist_name: formData.artist_name,
				artist_image: artistImage || undefined,
				start_time: formData.start_time || undefined,
				end_time: formData.end_time || undefined,
				is_headliner: formData.is_headliner,
				notes: formData.notes || undefined,
				socials: formData.socials,
			});
			if (!isEdit) {
				setFormData(initialFormData);
			}
		} catch (error) {
			if (error) throw error;
		}
	};

	const handleChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (field === "artist_name") {
			setErrors((prev) => ({ ...prev, artist_name: "" }));
		}
	};

	const handleTimeChange = (name: "start_time" | "end_time", value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageChange = (file: File | null) => {
		setErrors((prev) => ({ ...prev, artist_image_url: "" }));
		setArtistImage(file);
		if (file) {
			setImagePreview(URL.createObjectURL(file));
		} else {
			setImagePreview(null);
		}
	};

	useImperativeHandle(ref, () => ({
		validate,
		getFormData: () => ({
			...formData,
			artist_image: artistImage || undefined,
		}),
		submit: async () => {
			await handleSubmit();
		},
	}));

	const containerClass = cn("space-y-4", {
		"border border-neutral-200 rounded-lg p-4 bg-white": isInline,
		"border border-neutral-200 rounded-lg p-6 bg-neutral-50": !isInline,
	});

	return (
		<form onSubmit={handleSubmit} className={containerClass}>
			<div className="flex flex-col lg:flex-row gap-5 items-start">
				{/* Artist Image */}
				<div>
					{/* <Label htmlFor="artist-image" className="body-3 font-medium">Artist Image *</Label> */}
					<div className="lg:mt-7 relative">
						{imagePreview ? (
							<div className=" w-20 h-20 rounded-lg overflow-hidden bg-neutral-100">
								<Image src={imagePreview} alt="Artist preview" fill className="object-cover" />
								<button
									type="button"
									onClick={() => handleImageChange(null)}
									className="absolute top-0 right-0 w-5 h-5 bg-red-500/80 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
								>
									<X className="w-3 h-3 " />
								</button>
							</div>
						) : (
							<div className="w-20 h-20 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
								<input
									type="file"
									accept="image/jpeg,image/png"
									onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
									className="hidden"
									id="artist-image"
								/>
								<label
									htmlFor="artist-image"
									className="cursor-pointer text-neutral-500 hover:text-neutral-700"
								>
									<UserPenIcon className="size-10 text-neutral-400" />
								</label>
							</div>
						)}
					</div>
					{errors.artist_image_url && (
						<small className="body-3 text-red-500">{errors.artist_image_url}</small>
					)}
				</div>

				<div className="space-y-3 flex-1">
					{/* Artist Name */}
					<div>
						<Label htmlFor="artist_name" className="body-3 font-medium">
							Artist Name *
						</Label>
						<Input
							id="artist_name"
							value={formData.artist_name}
							onChange={(e) => handleChange("artist_name", e.target.value)}
							placeholder="Enter artist name"
							required
							className="mt-1"
						/>
						{errors.artist_name && (
							<small className="body-3 text-red-500">{errors.artist_name}</small>
						)}
					</div>

					{/* Notes */}
					{showNotes && (
						<div className="flex gap-2 items-start">
							<div className="flex-1">
								<Textarea
									value={formData.notes}
									onChange={(e) => handleChange("notes", e.target.value)}
									placeholder="Enter artist notes or bio (optional)"
									rows={3}
									maxLength={250}
									className="resize-none"
								/>
								<div className="text-xs text-neutral-500 mt-1 text-right">
									{formData.notes.length}/250
								</div>
							</div>
							<X
								className="w-4 h-4 text-neutral-600 hover:text-neutral-800 cursor-pointer mt-2"
								onClick={() => setShowNotes(false)}
							/>
						</div>
					)}

					{/* Time Selection */}
					<div className="flex gap-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="start_time" className="body-3 font-medium">
								Start Time
							</Label>
							<TimeSelect
								value={formData.start_time}
								onChange={(value) => handleTimeChange("start_time", value)}
								disabled={isLoading}
								placeholder="Select start time"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="end_time" className="body-3 font-medium">
								End Time
							</Label>
							<TimeSelect
								value={formData.end_time}
								onChange={(value) => handleTimeChange("end_time", value)}
								disabled={isLoading}
								placeholder="Select end time"
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="flex gap-2 justify-end">
				{/* Add Notes Button */}
				{!showNotes && (
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setShowNotes(true)}
							className="button-ghost flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-800 transition-colors py-1"
						>
							<FileText className="w-4 h-4" />
							<span>Add notes</span>
						</button>
					</div>
				)}
				{/* Headliner Toggle */}
				<div className="flex items-center gap-3">
					<Label htmlFor="is_headliner" className="body-3 font-medium">
						Mark as headliner
					</Label>
					<AppSwitch
						id="is_headliner"
						checked={formData.is_headliner}
						onCheckedChange={(checked) => handleChange("is_headliner", checked)}
						disabled={isLoading}
					/>
				</div>
			</div>
			{/* Actions */}
			<div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
				<AppButton
					type="button"
					variant="outline"
					buttonType="icon"
					onClick={onCancel}
					disabled={isLoading}
					className="p-2 text-error-500"
				>
					Remove{" "}
				</AppButton>
				{isEdit && (
					<AppButton
						type="submit"
						disabled={isLoading || !formData.artist_name.trim()}
						isLoading={isLoading}
						variant="primary"
					>
						Save Changes
					</AppButton>
				)}
			</div>
		</form>
	);
});
