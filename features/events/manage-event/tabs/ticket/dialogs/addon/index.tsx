"use client";

import React from "react";
import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import AppSwitch from "@/components/app/app-switch";
import { Input, Textarea, SelectBox, DateInput, TimeInput } from "@/components/app/form-input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
	BadgeDollarSign,
	ChevronDown,
	Heart,
	Link2,
	Package,
	Settings2,
	CheckCircle2,
	Unlink,
} from "lucide-react";
import useAddon from "./use-addon";
import TicketMultiSelect from "./ticket-multi-select";

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({
	step,
	label,
	icon,
	muted,
	trailing,
}: {
	step: string;
	label: string;
	icon?: React.ReactNode;
	muted?: boolean;
	trailing?: React.ReactNode;
}) {
	return (
		<div className="flex items-center gap-3 mb-1">
			<span
				className={cn(
					"flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0",
					muted ? "bg-neutral-200 text-neutral-400" : "bg-primary-500 text-white"
				)}
			>
				{step}
			</span>
			<div className="flex items-center gap-1.5">
				{icon}
				<span
					className={cn(
						"body-2 font-semibold",
						muted ? "text-neutral-400" : "text-neutral-800"
					)}
				>
					{label}
				</span>
			</div>
			<div className="flex-1 h-px bg-neutral-200" />
			{trailing}
		</div>
	);
}

// ─── Addon type card data ─────────────────────────────────────────────────────
const addonTypeCards: {
	value: "paid" | "free" | "donation";
	label: string;
	description: string;
	icon: React.ReactNode;
	selectedBg: string;
	selectedBorder: string;
	iconBg: string;
	checkColor: string;
}[] = [
	{
		value: "paid",
		label: "Paid",
		description: "Attendees pay a fixed price for this addon",
		icon: <BadgeDollarSign className="w-5 h-5 text-green-600" />,
		selectedBg: "bg-green-500/5",
		selectedBorder: "border-green-500",
		iconBg: "bg-green-500/10",
		checkColor: "text-green-500",
	},
	{
		value: "free",
		label: "Free",
		description: "Included at no cost with the ticket purchase",
		icon: <Package className="w-5 h-5 text-blue-600" />,
		selectedBg: "bg-blue-500/5",
		selectedBorder: "border-blue-500",
		iconBg: "bg-blue-500/10",
		checkColor: "text-blue-500",
	},
	{
		value: "donation",
		label: "Donation",
		description: "Attendees choose how much to contribute",
		icon: <Heart className="w-5 h-5 text-purple-600" />,
		selectedBg: "bg-purple-500/5",
		selectedBorder: "border-purple-500",
		iconBg: "bg-purple-500/10",
		checkColor: "text-purple-500",
	},
];

// ─── Main component ───────────────────────────────────────────────────────────
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

	const [advancedOpen, setAdvancedOpen] = React.useState(false);

	const addonType = formData.type;
	const isPaid = addonType === "paid";
	const isDonation = addonType === "donation";
	const isStandalone =
		!formData.ticket_ids || formData.ticket_ids.length === 0;

	return (
		<AppDrawer
			title={isEditMode ? "Edit Addon" : "Create Addon"}
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
			<div className="p-5 space-y-8">

				{/* ── Step 01 — Addon Type ── */}
				<div className="space-y-3">
					<StepHeader
						step="01"
						label="Addon Type"
						icon={<Package className="w-3.5 h-3.5 text-neutral-500" />}
						trailing={
							<div className="flex items-center gap-2 shrink-0">
								<span className="body-3 text-neutral-500 select-none">
									{formData.is_active ? "Active" : "Inactive"}
								</span>
								<AppSwitch
									checked={formData.is_active}
									onCheckedChange={(val) => updateForm("is_active", val)}
								/>
							</div>
						}
					/>

					<div className="grid grid-cols-3 gap-3">
						{addonTypeCards.map((card) => {
							const isSelected = addonType === card.value;
							return (
								<button
									key={card.value}
									type="button"
									onClick={() => updateForm("type", card.value)}
									className={cn(
										"relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-200 text-center",
										isSelected
											? `${card.selectedBorder} ${card.selectedBg} shadow-sm`
											: "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
									)}
								>
									{isSelected && (
										<CheckCircle2
											className={cn(
												"absolute top-2 right-2 w-3.5 h-3.5",
												card.checkColor
											)}
										/>
									)}
									<span
										className={cn(
											"flex items-center justify-center w-9 h-9 rounded-full",
											card.iconBg
										)}
									>
										{card.icon}
									</span>
									<div>
										<p
											className={cn(
												"body-3 font-semibold",
												isSelected ? "text-neutral-900" : "text-neutral-700"
											)}
										>
											{card.label}
										</p>
										<p className="text-[10px] leading-snug text-neutral-400 mt-0.5">
											{card.description}
										</p>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* ── Step 02 — Ticket Attachment ── */}
				<div className="space-y-3">
					<StepHeader
						step="02"
						label="Ticket Attachment"
						icon={<Link2 className="w-3.5 h-3.5 text-neutral-500" />}
						trailing={
							isStandalone ? (
								<span className="inline-flex items-center gap-1 body-3 text-neutral-400 shrink-0">
									<Unlink className="w-3 h-3" />
									Standalone
								</span>
							) : (
								<span className="inline-flex items-center gap-1 body-3 text-primary-500 font-medium shrink-0">
									<Link2 className="w-3 h-3" />
									{formData.ticket_ids!.length} linked
								</span>
							)
						}
					/>

					<TicketMultiSelect
						tickets={tickets}
						selectedTicketIds={formData.ticket_ids || []}
						onChange={(ticketIds) =>
							updateForm("ticket_ids", ticketIds.length > 0 ? ticketIds : null)
						}
						placeholder="Select tickets (optional)"
					/>
					{isStandalone && (
						<p className="text-[11px] text-neutral-400">
							Leave empty to make this a standalone addon available without a specific ticket.
						</p>
					)}
				</div>

				{/* ── Step 03 — Addon Details ── */}
				<div className="space-y-4">
					<StepHeader step="03" label="Addon Details" />

					<Input
						label="Addon Name"
						floatingLabel
						value={formData.name}
						placeholder="e.g. Meal Package, T-Shirt, Parking Pass"
						onChange={(e) => updateForm("name", e.target.value)}
						errorMessage={errors.name}
						required
					/>

					{addonType !== "free" && (
						<div className="space-y-1.5">
							<Input
								label={isDonation ? "Suggested Amount (Optional)" : "Price"}
								floatingLabel
								value={`${selectedCurrency.symbol} ${formData.price ?? ""}`}
								onChange={(e) => updateForm("price", e.target.value)}
								errorMessage={errors.price}
								required={isPaid}
								placeholder={isDonation ? "Leave empty for open amount" : ""}
								floatingComponent={
									<SelectBox
										containerStyle="!border-none !border-0 !outline-none"
										className="!outline-none !outline-0 border p-0"
										options={currencyOptions}
										value={selectedCurrency.id}
										onchange={(e) => updateForm("currency_id", e)}
									/>
								}
							/>
							{isDonation && (
								<p className="text-[11px] text-neutral-400">
									Attendees choose the amount. Optionally set a suggested minimum.
								</p>
							)}
						</div>
					)}

					<Textarea
						label="Description (Optional)"
						floatingLabel
						value={formData.description || ""}
						placeholder="Briefly describe what this addon includes"
						onChange={(e) => updateForm("description", e.target.value)}
						errorMessage={errors.description}
						rows={3}
					/>
				</div>

				{/* ── Step 04 — Advanced Settings (collapsible) ── */}
				<Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
					<CollapsibleTrigger asChild>
						<button type="button" className="w-full flex items-center gap-3 group">
							<span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-600 text-[10px] font-bold shrink-0 group-hover:bg-neutral-300 transition-colors">
								04
							</span>
							<div className="flex items-center gap-1.5">
								<Settings2 className="w-3.5 h-3.5 text-neutral-500" />
								<span className="body-2 font-semibold text-neutral-800">
									Advanced Settings
								</span>
							</div>
							<div className="flex-1 h-px bg-neutral-200" />
							<ChevronDown
								className={cn(
									"w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0",
									advancedOpen && "rotate-180"
								)}
							/>
						</button>
					</CollapsibleTrigger>

					<CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
						<div className="space-y-6 pt-5">

							{/* Sales window */}
							<div className="space-y-3">
								<p className="body-3 font-medium text-neutral-500">Sales Window</p>
								<div className="grid grid-cols-2 gap-4">
									<DateInput
										label="Start Date"
										floatingLabel
										value={
											formData.sales_start_date
												? new Date(formData.sales_start_date)
												: undefined
										}
										onChange={(d) =>
											updateForm("sales_start_date", d?.toISOString() ?? "")
										}
										errorMessage={errors.sales_start_date}
										required
									/>
									<TimeInput
										label="Start Time"
										floatingLabel
										value={formData.sales_start_time || ""}
										onChange={(t) => updateForm("sales_start_time", t || null)}
										modal
									/>
									<DateInput
										label="End Date"
										floatingLabel
										value={
											formData.sales_end_date
												? new Date(formData.sales_end_date)
												: undefined
										}
										onChange={(d) =>
											updateForm("sales_end_date", d ? d.toISOString() : null)
										}
										errorMessage={errors.sales_end_date}
									/>
									<TimeInput
										label="End Time"
										floatingLabel
										modal
										value={formData.sales_end_time || ""}
										onChange={(t) => updateForm("sales_end_time", t || null)}
									/>
								</div>
							</div>

							{/* Expiration */}
							<div className="space-y-3">
								<p className="body-3 font-medium text-neutral-500">Expiration</p>
								<DateInput
									label="Expires At (Optional)"
									floatingLabel
									value={
										formData.expires_at ? new Date(formData.expires_at) : undefined
									}
									onChange={(d) =>
										updateForm("expires_at", d ? d.toISOString() : null)
									}
									errorMessage={errors.expires_at}
								/>
								<p className="text-[11px] text-neutral-400">
									After this date, the addon will no longer be available regardless of the sales window.
								</p>
							</div>

						</div>
					</CollapsibleContent>
				</Collapsible>

			</div>
		</AppDrawer>
	);
}
