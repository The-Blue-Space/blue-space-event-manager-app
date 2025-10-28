"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { X, User, List, UserPlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppButton from "@/components/app/app-button";
import { Textarea } from "@/components/app/form-input";
import { EventAgenda } from "@/types/event-agenda.types";
import TimeSelect from "../time-select";
import { Badge } from "@/components/ui/badge";

type HostInput = {
	name: string;
	image?: File;
	imageUrl?: string;
};

export type AgendaFormRef = {
	validate: () => boolean;
	getFormData: () => {
		title: string;
		description: string;
		start_time: string;
		end_time: string;
	};
	submit: () => Promise<void>;
};

type AgendaItemFormProps = {
	agenda?: EventAgenda;
	onSave: (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		hosts: Array<{ name: string; image?: File }>;
	}) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
	isInline?: boolean;
};

export default forwardRef<AgendaFormRef, AgendaItemFormProps>(function AgendaItemForm(
	{ agenda, onSave, onCancel, isLoading = false, isInline = false },
	ref
) {
	const [formData, setFormData] = useState({
		title: agenda?.title || "",
		description: agenda?.description || "",
		start_time: agenda?.start_time || "",
		end_time: agenda?.end_time || "",
	});
	const [errors, setErrors] = useState({
		title: "",
	});

	const [hosts, setHosts] = useState<HostInput[]>(
		agenda?.hosts.map((host) => ({
			name: host.host_name,
			imageUrl: host.host_image_url,
		})) || []
	);

	const [showDescription, setShowDescription] = useState(!!agenda?.description);
	const [showHosts, setShowHosts] = useState(agenda?.hosts.length ? true : false);

	const validate = () => {
		let isValid = true;
		const newErrors = { title: "" };

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
			isValid = false;
		}

		// if (!formData.start_time) {
		// 	toast.error("Start time is required");
		// 	isValid = false;
		// }

		// if (!formData.end_time) {
		// 	toast.error("End time is required");
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

		await onSave({
			title: formData.title,
			description: formData.description || undefined,
			start_time: formData.start_time,
			end_time: formData.end_time,
			hosts: hosts
				.filter((host) => host.name.trim())
				.map((host) => ({
					name: host.name,
					image: host.image,
				})),
		});
	};

	const handleChange = (field: string, value: string) => {
		setErrors({ ...errors, [field]: "" });
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleTimeChange = (name: "start_time" | "end_time", value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddHost = () => {
		if (!showHosts) {
			setShowHosts(true);
		}
		setHosts([...hosts, { name: "" }]);
	};

	const handleRemoveHost = (index: number) => {
		setHosts(hosts.filter((_, i) => i !== index));
	};

	const handleHostChange = (index: number, field: "name", value: string) => {
		const newHosts = [...hosts];
		newHosts[index][field] = value;
		setHosts(newHosts);
	};

	const handleHostImageChange = (index: number, file: File | null) => {
		const newHosts = [...hosts];
		if (file) {
			newHosts[index].image = file;
			newHosts[index].imageUrl = URL.createObjectURL(file);
		} else {
			newHosts[index].image = undefined;
			newHosts[index].imageUrl = undefined;
		}
		setHosts(newHosts);
	};

	useImperativeHandle(ref, () => ({
		validate,
		getFormData: () => formData,
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
			{/* Title */}
			<div className="">
				<Label htmlFor="title">Title *</Label>
				<Input
					id="title"
					value={formData.title}
					onChange={(e) => handleChange("title", e.target.value)}
					placeholder="Enter title"
					required
					className="mt-1"
				/>
				{errors.title && <small className="body-3 text-red-500">{errors.title}</small>}
			</div>

			{showDescription && (
				<div className="flex gap-2 items-center">
					<div className="flex-1">
						<Textarea
							value={formData.description}
							onChange={(e) => handleChange("description", e.target.value)}
							placeholder="Enter description (optional)"
							rows={3}
							maxLength={1000}
							className="resize-none"
						/>
						<div className="text-xs text-neutral-500 mt-1 text-right">
							{formData.description.length}/200
						</div>
					</div>
					<X
						className="w-4 h-4 text-neutral-600 hover:text-neutral-800 cursor-pointer"
						onClick={() => setShowDescription(false)}
					/>
				</div>
			)}

			{/* Time Selection */}
			<div className="flex gap-4 mb-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="start_time">Start time</Label>
					<TimeSelect
						value={formData.start_time}
						onChange={(value) => handleTimeChange("start_time", value)}
						disabled={isLoading}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="end_time">End time</Label>
					<TimeSelect
						value={formData.end_time}
						onChange={(value) => handleTimeChange("end_time", value)}
						disabled={isLoading}
					/>
				</div>
			</div>

			{/* Toggleable Hosts */}
			<div className="">
				{showHosts && (
					<div className="mt-3 space-y-3">
						{hosts.map((host, index) => (
							<div
								key={index}
								className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-white"
							>
								{/* Host Image */}
								<Badge
									variant="outline"
									className="relative size-10 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center"
								>
									{host.imageUrl ? (
										<label htmlFor={`host-image-${index}`} className="cursor-pointer">
											<Image
												src={host.imageUrl}
												alt={host.name || "Host"}
												fill
												className="object-cover"
											/>
										</label>
									) : (
										<>
											<label htmlFor={`host-image-${index}`} className="cursor-pointer">
												<User className="h-full w-full text-neutral-600" />
											</label>
										</>
									)}
									<input
										type="file"
										accept="image/*"
										onChange={(e) => handleHostImageChange(index, e.target.files?.[0] || null)}
										className="hidden"
										id={`host-image-${index}`}
									/>
								</Badge>

								{/* Host Name Input */}
								<div className="flex-1">
									<Input
										value={host.name}
										onChange={(e) => handleHostChange(index, "name", e.target.value)}
										placeholder="Host/Artist name"
									/>
								</div>

								{/* Image Upload */}

								{/* Remove Host */}
								<button
									type="button"
									onClick={() => handleRemoveHost(index)}
									className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						))}
					</div>
				)}

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setShowDescription(!showDescription)}
						className="button-ghost flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-800 transition-colors py-1"
					>
						<List className="w-4 h-4" />
						<span>Add description</span>
					</button>
					<button
						type="button"
						onClick={handleAddHost}
						className="button-ghost flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-800 transition-colors py-1"
					>
						<UserPlus className="w-4 h-4" />
						<span>Host or Artist</span>
					</button>
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
					className="p-2"
				>
					<Trash2 className="w-4 h-4 text-red-500" />
				</AppButton>
			</div>
		</form>
	);
});
