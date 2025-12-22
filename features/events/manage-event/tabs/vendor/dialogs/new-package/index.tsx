"use client";
import AppDrawer from "@/components/app/app-drawer";
import React from "react";
import { vendorPackageTypes, formFieldTypes } from "../../data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useNewPackage from "./use-new-package";
import { Input, SelectBox, Textarea } from "@/components/app/form-input";
import AppSwitch from "@/components/app/app-switch";
import AppButton from "@/components/app/app-button";
import AppCheckbox from "@/components/app/app-checkbox";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function NewPackage() {
	const {
		open,
		onOpenChange,
		formData,
		errors,
		isLoading,
		submit,
		updateForm,
		currencyOptions,
		selectedCurrency,
		addFormField,
		updateFormField,
		removeFormField,
	} = useNewPackage();

	const packageType = formData.price > 0 ? "paid" : "free";

	return (
		<AppDrawer
			title="Create Vendor Package"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
			footer={
				<div className="flex justify-between border-t border-neutral-200 pt-2">
					<AppButton variant="outline" onClick={() => onOpenChange()}>
						Cancel
					</AppButton>
					<AppButton onClick={submit} isLoading={isLoading} variant="primary">
						Create Package
					</AppButton>
				</div>
			}
		>
			<div className="p-4">
				{/* Package Type Selection */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					{vendorPackageTypes.map((item) => (
						<Card
							key={item.id}
							className={cn(
								"p-2 flex items-center gap-2 hover:bg-badge/10 cursor-pointer transition-all duration-300",
								{
									"!border-1 border-neutral-500/50 bg-primary-500/10":
										packageType === item.value,
								}
							)}
							onClick={() =>
								updateForm("price", item.value === "free" ? 0 : formData.price || 1)
							}
						>
							<Badge className={cn("p-2 rounded-full", item.badgeBg)}>
								{item.smallIcon}
							</Badge>
							<div>
								<h5 className="body-3 font-medium text-primary-500">{item.name}</h5>
							</div>
						</Card>
					))}
					<div className="col-span-full">
						<p className="body-2 text-neutral-500">
							{vendorPackageTypes.find((item) => item.value === packageType)?.description ?? ""}
						</p>
					</div>
				</div>

				<form className="space-y-6">
					{/* Package Details Section */}
					<div>
						<div className="border-b border-neutral-200 mb-4">
							<h5 className="body-2 font-medium text-neutral-500">Package Details</h5>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input
								name="name"
								label="Package Name"
								placeholder="e.g., Standard Booth"
								value={formData.name}
								onChange={(e) => updateForm("name", e.target.value)}
								errorMessage={errors.name}
								floatingLabel
								required
							/>

							<div className="col-span-full">
								<Textarea
									name="description"
									label="Description"
									placeholder="Describe what's included in this package..."
									value={formData.description || ""}
									onChange={(e) => updateForm("description", e.target.value)}
									errorMessage={errors.description}
									floatingLabel
									rows={3}
								/>
							</div>

							{packageType === "paid" && (
								<div className="col-span-full">
									<Input
										name="price"
										label="Price"
										placeholder="0"
										value={`${selectedCurrency.symbol} ${formData.price || ""}`}
										onChange={(e) => updateForm("price", e.target.value)}
										errorMessage={errors.price}
										floatingLabel
										floatingComponent={
											<SelectBox
												containerStyle="!border-none !border-0 !outline-none"
												className="!outline-none !outline-0 border p-0"
												options={currencyOptions}
												value={selectedCurrency.id}
												onchange={(e) => updateForm("currency_id", e)}
											/>
										}
										required
									/>
								</div>
							)}

							<Input
								name="total_quantity"
								label="Total Slots Available"
								placeholder="10"
								type="number"
								value={formData.total_quantity}
								onChange={(e) => updateForm("total_quantity", Number(e.target.value))}
								errorMessage={errors.total_quantity}
								floatingLabel
								required
							/>

							<Input
								name="max_per_vendor"
								label="Max Per Vendor"
								placeholder="1"
								type="number"
								value={formData.max_per_vendor}
								onChange={(e) => updateForm("max_per_vendor", Number(e.target.value))}
								errorMessage={errors.max_per_vendor}
								floatingLabel
								required
							/>

							<div className="col-span-full">
								<Textarea
									name="amenities"
									label="Amenities (comma-separated)"
									placeholder="Table, Chairs, Power outlet, WiFi..."
									value={formData.amenities || ""}
									onChange={(e) => updateForm("amenities", e.target.value)}
									floatingLabel
									rows={2}
								/>
								{formData.amenities && (
									<div className="flex gap-1 flex-wrap mt-2">
										{formData.amenities
											.split(",")
											.filter((a) => a.trim())
											.map((amenity, idx) => (
												<Badge
													key={idx}
													variant="outline"
													className="body-3 bg-neutral-100"
												>
													{amenity.trim()}
												</Badge>
											))}
									</div>
								)}
							</div>

							<div className="col-span-full flex justify-between items-center">
								<label className="body-2 text-neutral-700">Requires Approval</label>
								<div className="flex items-center gap-4">
									<span className="body-3 text-neutral-500">
										{formData.requires_approval === null
											? "Use default"
											: formData.requires_approval
											? "Yes"
											: "No (Auto-approve)"}
									</span>
									<AppSwitch
										checked={formData.requires_approval === true}
										onCheckedChange={(checked) =>
											updateForm("requires_approval", checked)
										}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Form Schema Builder Section */}
					<div>
						<div className="border-b border-neutral-200 mb-4">
							<h5 className="body-2 font-medium text-neutral-500">
								Application Questions (Optional)
							</h5>
							<p className="body-3 text-neutral-400 mb-2">
								Add custom questions vendors must answer when applying
							</p>
						</div>

						<div className="space-y-4">
							{formData.form_schema.map((field, index) => (
								<Card key={index} className="p-4 space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<GripVertical className="w-4 h-4 text-neutral-400 cursor-move" />
											<span className="body-3 text-neutral-500">
												Question {index + 1}
											</span>
										</div>
										<button
											type="button"
											onClick={() => removeFormField(index)}
											className="text-error-500 hover:text-error-600"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<Input
											label="Question Label"
											placeholder="e.g., What products will you sell?"
											value={field.label}
											onChange={(e) =>
												updateFormField(index, { label: e.target.value })
											}
											floatingLabel
											required
										/>

										<SelectBox
											label="Field Type"
											options={formFieldTypes.map((t) => ({
												title: t.label,
												value: t.value,
											}))}
											value={field.field_type}
											onchange={(value) =>
												updateFormField(index, {
													field_type: value as typeof field.field_type,
												})
											}
											floatingLabel
										/>

										<Input
											label="Placeholder"
											placeholder="Placeholder text..."
											value={field.placeholder || ""}
											onChange={(e) =>
												updateFormField(index, { placeholder: e.target.value })
											}
											floatingLabel
										/>

										<div className="flex items-center gap-2">
											<AppCheckbox
												id={`required-${index}`}
												checked={field.required}
												onCheckedChange={(checked) =>
													updateFormField(index, { required: checked === true })
												}
											/>
											<label
												htmlFor={`required-${index}`}
												className="body-3 text-neutral-600"
											>
												Required field
											</label>
										</div>

										{field.field_type === "select" && (
											<div className="col-span-full">
												<Input
													label="Options (comma-separated)"
													placeholder="Option 1, Option 2, Option 3"
													value={field.options?.join(", ") || ""}
													onChange={(e) =>
														updateFormField(index, {
															options: e.target.value
																.split(",")
																.map((o) => o.trim())
																.filter(Boolean),
														})
													}
													floatingLabel
												/>
											</div>
										)}
									</div>
								</Card>
							))}

							<AppButton
								type="button"
								variant="outline"
								onClick={addFormField}
								className="w-full"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Question
							</AppButton>
						</div>
					</div>
				</form>
			</div>
		</AppDrawer>
	);
}
