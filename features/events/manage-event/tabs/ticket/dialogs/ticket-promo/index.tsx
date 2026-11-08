"use client";

import React from "react";
import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import AppSwitch from "@/components/app/app-switch";
import { Input, Textarea, SelectBox, DateInput, TimeInput } from "@/components/app/form-input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Render from "@/components/app/render";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
	BadgePercent,
	ChevronDown,
	Gift,
	Settings2,
	Ticket,
	X,
	CheckCircle2,
} from "lucide-react";
import useTicketPromo from "./use-ticket-promo";
import DiscountForm from "./discount-form";
import FreebieForm from "./freebie-form";
import { ticketTypes } from "../../data";
import { PromoType } from "@/types/event-ticket.types";
import { amountSeparator } from "@/lib/amount-separator";
import useAppSelector from "@/store/hooks";

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({
	step,
	label,
	icon,
	active,
	muted,
	trailing,
}: {
	step: string;
	label: string;
	icon?: React.ReactNode;
	active?: boolean;
	muted?: boolean;
	trailing?: React.ReactNode;
}) {
	return (
		<div className="flex items-center gap-3 mb-1">
			<span
				className={cn(
					"flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0",
					muted
						? "bg-neutral-200 text-neutral-400"
						: "bg-primary-500 text-white"
				)}
			>
				{step}
			</span>
			<div className="flex items-center gap-1.5">
				{icon}
				<span className={cn("body-2 font-semibold", muted ? "text-neutral-400" : "text-neutral-800")}>
					{label}
				</span>
			</div>
			<div className="flex-1 h-px bg-neutral-200" />
			{trailing}
		</div>
	);
}

// ─── Promo type card data ─────────────────────────────────────────────────────
const promoTypeCards: {
	value: PromoType;
	label: string;
	description: string;
	icon: React.ReactNode;
	selectedBg: string;
	selectedBorder: string;
	iconBg: string;
}[] = [
	{
		value: "discount",
		label: "Discount",
		description: "Reduce price by a % or fixed amount",
		icon: <BadgePercent className="w-5 h-5 text-green-600" />,
		selectedBg: "bg-green-500/5",
		selectedBorder: "border-green-500",
		iconBg: "bg-green-500/10",
	},
	{
		value: "free_ticket",
		label: "Free Ticket",
		description: "Give free tickets based on purchase",
		icon: <Gift className="w-5 h-5 text-purple-600" />,
		selectedBg: "bg-purple-500/5",
		selectedBorder: "border-purple-500",
		iconBg: "bg-purple-500/10",
	},
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function TicketPromo() {
	const { activeCurrency } = useAppSelector("init");

	const {
		open,
		onOpenChange,
		isLoading,
		isLoadingPromo,
		tickets,
		selectedTicketId,
		setSelectedTicketId,
		formData,
		errors,
		updateForm,
		handlePromoTypeChange,
		saving,
		handleSave,
		existingPromo,
	} = useTicketPromo();

	const [advancedOpen, setAdvancedOpen] = React.useState(false);

	const isActive = formData.is_active;
	const promoType = formData.promo_type;
	const isEdit = !!existingPromo;

	const ticketOptions = tickets.map((t) => ({ value: t.id, title: t.name }));

	const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;
	const selectedTicketTypeInfo = selectedTicket
		? ticketTypes.find((tt) => tt.value === selectedTicket.type)
		: null;

	return (
		<AppDrawer
			title={isEdit ? "Edit Promo" : "Configure Promo"}
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
					<AppButton
						onClick={handleSave}
						isLoading={saving}
						variant="primary"
						disabled={!selectedTicketId}
					>
						{isEdit ? "Update Promo" : "Save Promo"}
					</AppButton>
				</div>
			}
		>
			<Render isLoading={isLoading}>
				<div className="p-5 space-y-8">

					{/* ── Step 01 — Target Ticket ── */}
					<div className="space-y-3">
						<StepHeader
							step="01"
							label="Target Ticket"
							icon={<Ticket className="w-3.5 h-3.5 text-neutral-500" />}
						/>

						{selectedTicket ? (
							<div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
								<span
									className={cn(
										"flex items-center justify-center w-9 h-9 rounded-full shrink-0",
										selectedTicketTypeInfo?.badgeBg ?? "bg-neutral-200"
									)}
								>
									{selectedTicketTypeInfo?.icon}
								</span>
								<div className="flex-1 min-w-0">
									<p className="body-3 font-semibold text-neutral-900 truncate">
										{selectedTicket.name}
									</p>
									<p className="text-[11px] text-neutral-400 capitalize flex items-center gap-1.5">
										<span>{selectedTicket.type}</span>
										{selectedTicket.price !== null && selectedTicket.price !== undefined && (
											<>
												<span className="text-neutral-300">·</span>
												<span>
													{selectedTicket.currency?.symbol ?? activeCurrency.symbol}{" "}
													{amountSeparator(selectedTicket.price)}
												</span>
											</>
										)}
									</p>
								</div>
								{!isEdit && (
									<button
										type="button"
										onClick={() => setSelectedTicketId(null)}
										className="flex items-center gap-1 body-3 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0"
									>
										<X className="w-3.5 h-3.5" />
										Change
									</button>
								)}
							</div>
						) : (
							<SelectBox
								label="Select Ticket"
								placeholder="Choose a ticket"
								options={ticketOptions}
								value={selectedTicketId || ""}
								onchange={(val) => setSelectedTicketId(val)}
								required
								errorMessage={errors.ticket_id}
							/>
						)}
					</div>

					{selectedTicketId && isLoadingPromo ? (
						<div className="space-y-6">
							{/* Step 02 skeleton */}
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<Skeleton className="h-6 w-6 rounded-full" />
									<Skeleton className="h-4 w-24" />
									<Skeleton className="flex-1 h-px" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<div className="grid grid-cols-2 gap-3">
									<Skeleton className="h-28 rounded-2xl" />
									<Skeleton className="h-28 rounded-2xl" />
								</div>
							</div>

							{/* Step 03 skeleton */}
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<Skeleton className="h-6 w-6 rounded-full" />
									<Skeleton className="h-4 w-28" />
									<Skeleton className="flex-1 h-px" />
								</div>
								<Skeleton className="h-10 w-full rounded-lg" />
								<div className="flex rounded-lg overflow-hidden border border-neutral-100">
									<Skeleton className="h-10 flex-1" />
									<Skeleton className="h-10 flex-1" />
								</div>
								<Skeleton className="h-10 w-full rounded-lg" />
								<div className="grid grid-cols-2 gap-4">
									<Skeleton className="h-10 rounded-lg" />
									<Skeleton className="h-10 rounded-lg" />
								</div>
								<Skeleton className="h-16 w-full rounded-lg" />
							</div>
						</div>
					) : selectedTicketId && (
						<>
							{/* ── Step 02 — Promo Type ── */}
							<div className="space-y-3">
								<StepHeader
									step="02"
									label="Promo Type"
									trailing={
										<div className="flex items-center gap-2 shrink-0">
											<span className="body-3 text-neutral-500 select-none">
												{isActive ? "Active" : "Inactive"}
											</span>
											<AppSwitch
												checked={isActive}
												onCheckedChange={(val) => updateForm("is_active", val)}
											/>
										</div>
									}
								/>

								<div className="grid grid-cols-2 gap-3">
									{promoTypeCards.map((card) => {
										const isSelected = promoType === card.value;
										return (
											<button
												key={card.value}
												type="button"
												onClick={() => handlePromoTypeChange(card.value)}
												className={cn(
													"relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-200 text-center",
													isSelected
														? `${card.selectedBorder} ${card.selectedBg} shadow-sm`
														: "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
												)}
											>
												{isSelected && (
													<CheckCircle2
														className={cn(
															"absolute top-2 right-2 w-4 h-4",
															card.value === "discount"
																? "text-green-500"
																: "text-purple-500"
														)}
													/>
												)}
												<span
													className={cn(
														"flex items-center justify-center w-10 h-10 rounded-full",
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
													<p className="text-[11px] leading-snug text-neutral-400 mt-0.5">
														{card.description}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</div>

							{/* ── Step 03 — Promo Details ── */}
							<div className="space-y-5">
								<StepHeader step="03" label="Promo Details" />

								<Input
									label="Promo Name"
									floatingLabel
									value={formData.name}
									placeholder="e.g. Early Bird Discount"
									onChange={(e) => updateForm("name", e.target.value)}
									errorMessage={errors.name}
									required
								/>

								{promoType === "discount" ? (
									<DiscountForm
										formData={formData}
										errors={errors}
										updateForm={updateForm}
									/>
								) : (
									<FreebieForm
										formData={formData}
										errors={errors}
										updateForm={updateForm}
									/>
								)}

								{/* Purchase limits */}
								<div className="space-y-2">
									<p className="body-3 font-medium text-neutral-500">Purchase Limits</p>
									<div className="grid grid-cols-2 gap-4">
										<Input
											label="Min Quantity"
											floatingLabel
											type="number"
											value={formData.min_purchase_quantity}
											placeholder="e.g. 1"
											onChange={(e) => updateForm("min_purchase_quantity", e.target.value)}
											errorMessage={errors.min_purchase_quantity}
											note="Min tickets to qualify"
										/>
										<Input
											label="Max Quantity"
											floatingLabel
											type="number"
											value={formData.max_purchase_quantity}
											placeholder="e.g. 10"
											onChange={(e) => updateForm("max_purchase_quantity", e.target.value)}
											errorMessage={errors.max_purchase_quantity}
											note="Max tickets eligible"
										/>
									</div>
								</div>

								<Textarea
									label="Internal Note (Optional)"
									floatingLabel
									value={formData.note}
									placeholder="Notes visible only to you"
									onChange={(e) => updateForm("note", e.target.value)}
									rows={2}
									errorMessage={errors.note}
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
									<div className="space-y-5 pt-5">
										{/* Sales window */}
										<div className="space-y-3">
											<p className="body-3 font-medium text-neutral-500">Promo Sales Window</p>
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
													value={formData.sales_start_time ?? ""}
													onChange={(t) => updateForm("sales_start_time", t || null)}
													modal
													errorMessage={errors.sales_start_time}
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
													value={formData.sales_end_time ?? ""}
													onChange={(t) => updateForm("sales_end_time", t || null)}
													errorMessage={errors.sales_end_time}
												/>
											</div>
										</div>

									</div>
								</CollapsibleContent>
							</Collapsible>
						</>
					)}
				</div>
			</Render>
		</AppDrawer>
	);
}
