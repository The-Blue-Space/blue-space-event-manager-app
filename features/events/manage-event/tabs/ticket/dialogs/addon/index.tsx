import AppDrawer from "@/components/app/app-drawer";
import React from "react";
import { ticketTypes } from "../../data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useAddon from "./use-addon";
import { DateInput, Input, SelectBox, Textarea, TimeInput } from "@/components/app/form-input";
import AppButton from "@/components/app/app-button";
import TicketMultiSelect from "./ticket-multi-select";

export default function AddonDialog() {
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
		tickets,
		isEditMode,
	} = useAddon();

	return (
		<AppDrawer
			title={isEditMode ? "Edit Addon" : "Create New Addon"}
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
						{isEditMode ? "Update Addon" : "Create Addon"}
					</AppButton>
				</div>
			}
		>
			<div className="p-4">
				{/* Addon Type Selection */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{ticketTypes.map((item) => (
						<Card
							key={item.id}
							className={cn(
								"p-2 flex items-center gap-2 hover:bg-badge/10 cursor-pointer transition-all duration-300",
								{
									"!border-1 border-neutral-500/50 bg-primary-500/10": formData.type === item.value,
								}
							)}
							onClick={() => updateForm("type", item.value)}
						>
							<Badge className={cn("p-2 rounded-full", item.badgeBg)}>{item.smallIcon}</Badge>
							<div>
								<h5 className="body-3 font-medium text-primary-500">{item.name}</h5>
							</div>
						</Card>
					))}
					<div className="col-span-full">
						<p className="body-2 text-neutral-500">
							{ticketTypes.find((item) => item.value === formData.type)?.description ?? ""}
						</p>
					</div>
				</div>

				<form className="py-4">
					<div className="space-y-5">
						{/* Ticket Attachment */}
						<div className="border-b border-neutral-200">
							<h5 className="body-2 font-medium text-neutral-500">Ticket Attachment</h5>
						</div>
						<TicketMultiSelect
							tickets={tickets}
							selectedTicketIds={formData.ticket_ids || []}
							onChange={(ticketIds) =>
								updateForm("ticket_ids", ticketIds.length > 0 ? ticketIds : null)
							}
							label="Attach to Tickets"
							placeholder="Select tickets (optional - leave empty for standalone addon)"
						/>

						{/* Addon Details */}
						<div className="border-b border-neutral-200">
							<h5 className="body-2 font-medium text-neutral-500">Addon Details</h5>
						</div>
						<div className="flex flex-col gap-5">
							<Input
								label="Addon Name"
								name="name"
								value={formData.name}
								onChange={(e) => updateForm("name", e.target.value)}
								errorMessage={errors.name}
								floatingLabel
								required
							/>
							{formData.type !== "free" && (
								<div className="flex flex-col gap-0">
									<Input
										label="Price"
										name="price"
										value={`${selectedCurrency.symbol} ${formData.price ?? ""}`}
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
										disabled={formData.type !== "paid"}
										required={formData.type === "paid"}
										placeholder={formData.type === "donation" ? "Variable amount (optional)" : ""}
									/>
									{formData.type === "donation" && (
										<p className="text-xs text-neutral-500 mt-1">
											For donation addons, attendees choose the amount. Leave price empty or set a
											suggested amount.
										</p>
									)}
								</div>
							)}
						</div>
						<div className="grid grid-cols-1 gap-5">
							<Textarea
								label="Description"
								name="description"
								value={formData.description || ""}
								onChange={(e) => updateForm("description", e.target.value)}
								errorMessage={errors.description}
								floatingLabel
								rows={3}
							/>
						</div>

						{/* Sales Period */}
						<div className="border-b border-neutral-200">
							<h5 className="body-2 font-medium text-neutral-500">Sales Period</h5>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<DateInput
								label="Sales Start Date"
								name="sales_start_date"
								value={formData.sales_start_date ? new Date(formData.sales_start_date) : undefined}
								onChange={(date) => updateForm("sales_start_date", date?.toISOString() ?? "")}
								errorMessage={errors.sales_start_date}
								floatingLabel
								required
							/>
							<TimeInput
								label="Sales Start Time"
								name="sales_start_time"
								modal
								floatingLabel
								value={formData.sales_start_time || ""}
								onChange={(time) => updateForm("sales_start_time", time)}
							/>
							<DateInput
								label="Sales End Date"
								name="sales_end_date"
								value={formData.sales_end_date ? new Date(formData.sales_end_date) : undefined}
								onChange={(date) => updateForm("sales_end_date", date?.toISOString() ?? "")}
								errorMessage={errors.sales_end_date}
								floatingLabel
							/>
							<TimeInput
								label="Sales End Time"
								name="sales_end_time"
								modal
								floatingLabel
								value={formData.sales_end_time || ""}
								onChange={(time) => updateForm("sales_end_time", time)}
							/>
						</div>

						{/* Expiration */}
						<div className="grid grid-cols-1 gap-5">
							<DateInput
								label="Expires At (Optional)"
								name="expires_at"
								value={formData.expires_at ? new Date(formData.expires_at) : undefined}
								onChange={(date) => updateForm("expires_at", date?.toISOString() ?? "")}
								errorMessage={errors.expires_at}
								floatingLabel
							/>
						</div>
					</div>
				</form>
			</div>
		</AppDrawer>
	);
}
