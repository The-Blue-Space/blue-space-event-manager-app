import AppDrawer from "@/components/app/app-drawer";
import React from "react";
import { ticketTypes } from "../../data";
import { cn } from "@/lib/utils";
import useNewTicket from "./use-new-ticket";
import { formFields } from "./data";
import { DateInput, Input, SelectBox } from "@/components/app/form-input";
import AppCheckbox from "@/components/app/app-checkbox";
import { ChevronDown, CheckCircle2, InfoIcon, Settings2, Ticket, X } from "lucide-react";
import AppTooltip from "@/components/app/app-tooltip";
import AppSwitch from "@/components/app/app-switch";
import TimeInput from "@/components/app/form-input/time-input";
import AppButton from "@/components/app/app-button";
import getFeeBreakdown from "@/services/events/event-tickets/get-fee-breakdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ─── Step header ────────────────────────────────────────────────────────────
function StepHeader({
	step,
	label,
	icon,
}: {
	step: string;
	label: string;
	icon?: React.ReactNode;
}) {
	return (
		<div className="flex items-center gap-3 mb-1">
			<span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold shrink-0">
				{step}
			</span>
			<div className="flex items-center gap-1.5">
				{icon}
				<span className="body-2 font-semibold text-neutral-800">{label}</span>
			</div>
			<div className="flex-1 h-px bg-neutral-200" />
		</div>
	);
}

// ─── Fee breakdown panel ─────────────────────────────────────────────────────
function FeePanel({
	show,
	price,
	absolveFee,
	feeLoading,
	feeError,
	feeData,
	currencySymbol,
	onAbsolveFeeChange,
}: {
	show: boolean;
	price: number;
	absolveFee: boolean;
	feeLoading: boolean;
	feeError: string | null;
	feeData: {
		total_fee: number;
		currency: { id: string; name: string; code: string; symbol: string };
		service_fee: { amount: number; percentage: number };
		processing_fee: { amount: number; percentage: number };
		net_amount: number;
	} | null;
	currencySymbol: string;
	onAbsolveFeeChange: (value: string) => void;
}) {
	const [open, setOpen] = React.useState(false);
	if (!show) return null;

	const sym = feeData?.currency.symbol ?? currencySymbol;

	// absorb=true:  attendee pays face value, planner receives face value minus fee
	// absorb=false: attendee pays face value plus fee, planner receives full face value
	const attendeePays = feeData
		? absolveFee
			? price
			: price + feeData.total_fee
		: null;

	const merchantReceives = feeData
		? absolveFee
			? feeData.net_amount   // planner absorbs: gets price - fee
			: price                // attendee absorbs: planner gets full face value
		: null;

	const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div className="mt-2 rounded-xl border border-neutral-200 overflow-hidden">
				{/* ── Summary row (always visible) ── */}
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors"
					>
						<div className="flex items-center gap-4">
							{feeLoading ? (
								<span className="body-3 text-neutral-400">Calculating fees…</span>
							) : feeError ? (
								<span className="body-3 text-error-500">{feeError}</span>
							) : attendeePays !== null ? (
								<>
									<span className="body-3 text-neutral-500">
										Attendee pays:{" "}
										<span className="font-semibold text-neutral-800">
											{sym} {fmt(attendeePays)}
										</span>
									</span>
									<span className="text-neutral-300">·</span>
									<span className="body-3 text-neutral-500">
										You receive:{" "}
										<span className="font-semibold text-neutral-800">
											{sym} {fmt(merchantReceives!)}
										</span>
									</span>
								</>
							) : (
								<span className="body-3 text-neutral-400">Loading fee info…</span>
							)}
						</div>
						<ChevronDown
							className={cn(
								"w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 shrink-0",
								open && "rotate-180"
							)}
						/>
					</button>
				</CollapsibleTrigger>

				{/* ── Full breakdown (expandable) ── */}
				<CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
					<div className="px-4 py-3 border-t border-neutral-200 space-y-2">
						{/* Absorb fee toggle */}
						<div className="flex items-center justify-between pb-2 border-b border-neutral-100">
							<label
								htmlFor="absolve-fee"
								className="body-3 flex items-center gap-1.5 text-neutral-600 cursor-pointer select-none"
							>
								Absorb platform fee
								<AppTooltip trigger={<InfoIcon className="w-3.5 h-3.5 text-neutral-400" />}>
									<p className="body-3 text-neutral-100">
										{absolveFee
											? "You are covering the fee. Attendees pay the face value only."
											: "The fee is added on top. Attendees pay face value + fee."}
									</p>
								</AppTooltip>
							</label>
							<AppCheckbox
								id="absolve-fee"
								checked={absolveFee}
								onCheckedChange={(checked) => onAbsolveFeeChange(checked === true ? "true" : "false")}
							/>
						</div>

						{/* Line items */}
						{feeData ? (
							<div className="space-y-1.5 body-3 text-neutral-600">
								<div className="flex justify-between">
									<span>Ticket price</span>
									<span>{sym} {fmt(price)}</span>
								</div>
								<div className="flex justify-between">
									<span>Service fee ({feeData.service_fee.percentage}%)</span>
									<span className={absolveFee ? "text-neutral-400" : ""}>
										{absolveFee ? "− " : "+ "}{sym} {fmt(feeData.service_fee.amount)}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Processing fee ({feeData.processing_fee.percentage}%)</span>
									<span className={absolveFee ? "text-neutral-400" : ""}>
										{absolveFee ? "− " : "+ "}{sym} {fmt(feeData.processing_fee.amount)}
									</span>
								</div>
								<div className="flex justify-between border-t border-neutral-200 pt-1.5 font-medium text-neutral-800">
									<span>Attendee pays</span>
									<span>{sym} {fmt(attendeePays!)}</span>
								</div>
								<div className="flex justify-between font-medium text-neutral-800">
									<span>You receive</span>
									<span>{sym} {fmt(merchantReceives!)}</span>
								</div>
							</div>
						) : feeLoading ? (
							<p className="body-3 text-neutral-400">Calculating…</p>
						) : null}
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

// ─── Perk tag input ───────────────────────────────────────────────────────────
function PerkTagInput({
	value,
	onChange,
	errorMessage,
	required,
}: {
	value: string;
	onChange: (value: string) => void;
	errorMessage?: string;
	required?: boolean;
}) {
	const tags = React.useMemo(
		() => value.split(",").map((t) => t.trim()).filter(Boolean),
		[value]
	);
	const [inputVal, setInputVal] = React.useState("");
	const inputRef = React.useRef<HTMLInputElement>(null);

	const addTag = (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || tags.includes(trimmed)) return;
		onChange([...tags, trimmed].join(","));
	};

	const removeTag = (idx: number) => {
		onChange(tags.filter((_, i) => i !== idx).join(","));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(inputVal);
			setInputVal("");
		} else if (e.key === "Backspace" && inputVal === "") {
			removeTag(tags.length - 1);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		if (val.includes(",")) {
			const parts = val.split(",");
			const remainder = parts.pop() ?? "";
			parts.forEach((p) => addTag(p));
			setInputVal(remainder);
		} else {
			setInputVal(val);
		}
	};

	return (
		<div className="flex flex-col gap-1.5">
			<label className="body-3 font-medium text-neutral-700">
				Perks {required && <span className="text-error-500">*</span>}
			</label>
			<div
				className={cn(
					"min-h-[42px] w-full flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-lg border border-neutral-200 bg-white cursor-text transition-colors focus-within:border-primary-500",
					errorMessage && "border-error-500"
				)}
				onClick={() => inputRef.current?.focus()}
			>
				{tags.map((tag, idx) => (
					<span
						key={idx}
						className="inline-flex items-center gap-1 body-3 bg-primary-500/8 text-primary-600 border border-primary-200 rounded-full pl-2.5 pr-1.5 py-0.5 shrink-0"
					>
						{tag}
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
							className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-primary-200 transition-colors"
						>
							<X className="w-2.5 h-2.5" />
						</button>
					</span>
				))}
				<input
					ref={inputRef}
					type="text"
					value={inputVal}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={tags.length === 0 ? "Type a perk and press Enter…" : "Add another…"}
					className="flex-1 min-w-[140px] outline-none bg-transparent body-3 text-neutral-800 placeholder:text-neutral-400 py-0.5"
				/>
			</div>
			<p className="body-3 text-neutral-400">Press Enter or comma to add each perk</p>
			{errorMessage && <p className="body-3 text-error-500">{errorMessage}</p>}
		</div>
	);
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function NewTicket() {
	const {
		open,
		eventId,
		onOpenChange,
		formData,
		errors,
		isLoading,
		submit,
		updateForm,
		currencyOptions,
		selectedCurrency,
	} = useNewTicket();

	const ticketInfo = formFields.filter((item) => item.section_slug === "ticket-details");
	const advancedSettings = formFields.filter((item) => item.section_slug === "advanced-settings");

	const [feeLoading, setFeeLoading] = React.useState(false);
	const [feeError, setFeeError] = React.useState<string | null>(null);
	const [feeData, setFeeData] = React.useState<{
		total_fee: number;
		currency: { id: string; name: string; code: string; symbol: string };
		service_fee: { amount: number; percentage: number };
		processing_fee: { amount: number; percentage: number };
		net_amount: number;
	} | null>(null);
	const [advancedOpen, setAdvancedOpen] = React.useState(false);

	const fetchFeeBreakdown = React.useCallback(async (price: number, currencyId: string) => {
		if (!price || !currencyId || !eventId) return;
		try {
			setFeeError(null);
			setFeeLoading(true);
			const res = await getFeeBreakdown({
				event_id: eventId,
				price,
				currency_id: currencyId,
			});
			setFeeData(res);
		} catch {
			setFeeError("Failed to load fees");
		} finally {
			setFeeLoading(false);
		}
	}, [eventId]);

	// Auto-fetch whenever price or currency changes (debounced)
	React.useEffect(() => {
		if (!formData.price || !formData.currency_id) {
			setFeeData(null);
			return;
		}
		const priceNum = Number(String(formData.price).replace(/[^0-9.]/g, ""));
		if (!priceNum) return;
		const timer = setTimeout(() => {
			fetchFeeBreakdown(priceNum, formData.currency_id!);
		}, 600);
		return () => clearTimeout(timer);
	}, [formData.price, formData.currency_id, fetchFeeBreakdown]);

	return (
		<AppDrawer
			title="Create Ticket"
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
						Create Ticket
					</AppButton>
				</div>
			}
		>
			<div className="p-5 space-y-8">

				{/* ── Ticket type selector ── */}
				<div className="space-y-3">
					<StepHeader step="01" label="Ticket Type" icon={<Ticket className="w-3.5 h-3.5 text-neutral-500" />} />
					<div className="grid grid-cols-3 gap-3">
						{ticketTypes.map((item) => {
							const isSelected = formData.type === item.value;
							return (
								<button
									key={item.id}
									type="button"
									onClick={() => updateForm("type", item.value)}
									className={cn(
										"relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center",
										isSelected
											? "border-primary-500 bg-primary-500/5 shadow-sm"
											: "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
									)}
								>
									{isSelected && (
										<CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary-500" />
									)}
									<span className={cn("flex items-center justify-center w-10 h-10 rounded-full", item.badgeBg)}>
										{item.icon}
									</span>
									<span
										className={cn(
											"body-3 font-semibold",
											isSelected ? "text-primary-600" : "text-neutral-700"
										)}
									>
										{item.name}
									</span>
									<span className="text-[11px] leading-snug text-neutral-400">{item.description}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* ── Ticket details ── */}
				<form className="space-y-8">
					<div className="space-y-5">
						<StepHeader step="02" label="Ticket Details" />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{ticketInfo.map((item) => {
								const key = item.name as keyof typeof formData;

								if (item.name === "price") {
									const floatingComponent = (
										<SelectBox
											containerStyle="!border-none !border-0 !outline-none"
											className="!outline-none !outline-0 border p-0"
											options={currencyOptions}
											value={selectedCurrency.id}
											onchange={(e) => updateForm("currency_id", e)}
										/>
									);
									return (
										<div className="col-span-full" key={item.name}>
											<Input
												{...item}
												value={`${selectedCurrency.symbol} ${formData[key] ?? ""}`}
												onChange={(e) => updateForm(key, e.target.value)}
												errorMessage={errors[key]}
												floatingLabel
												floatingComponent={floatingComponent}
												disabled={formData.type === "free" || formData.type === "donation"}
												required={item.required}
											/>
											<FeePanel
												show={!!formData.price && Number(String(formData.price).replace(/[^0-9.]/g, "")) > 0}
												price={Number(String(formData.price).replace(/[^0-9.]/g, ""))}
												absolveFee={formData.absolve_fee === true}
												feeLoading={feeLoading}
												feeError={feeError}
												feeData={feeData}
												currencySymbol={selectedCurrency.symbol}
												onAbsolveFeeChange={(val) => updateForm("absolve_fee", val)}
											/>
										</div>
									);
								}

								if (item.name === "perks") {
									return (
										<div className="col-span-full" key={item.name}>
											<PerkTagInput
												value={formData.perks}
												onChange={(val) => updateForm("perks", val)}
												errorMessage={errors[key]}
												required={item.required}
											/>
										</div>
									);
								}

								if (item.name === "total_quantity") {
									return (
										<div className="col-span-full" key={item.name}>
											<Input
												{...item}
												value={formData[key] as string}
												onChange={(e) => updateForm(key, e.target.value)}
												errorMessage={errors[key]}
												floatingLabel
												required={item.required}
												disabled={formData.unlimited_quantity === true}
											/>
											<div className="flex items-center justify-between mt-2 px-1">
												<label
													htmlFor="unlimited-quantity"
													className="body-3 text-neutral-500 cursor-pointer select-none"
												>
													Unlimited quantity
												</label>
												<AppSwitch
													id="unlimited-quantity"
													checked={formData.unlimited_quantity === true}
													onCheckedChange={(checked) =>
														updateForm("unlimited_quantity", checked.toString())
													}
												/>
											</div>
										</div>
									);
								}

								return (
									<Input
										key={item.name}
										{...item}
										value={formData[key] as string}
										onChange={(e) => updateForm(key, e.target.value)}
										errorMessage={errors[key]}
										floatingLabel
										required={item.required}
									/>
								);
							})}
						</div>
					</div>

					{/* ── Advanced settings (collapsible) ── */}
					<Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
						<CollapsibleTrigger asChild>
							<button
								type="button"
								className="w-full flex items-center gap-3 group"
							>
								<span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-200 text-neutral-600 text-[10px] font-bold shrink-0 group-hover:bg-neutral-300 transition-colors">
									03
								</span>
								<div className="flex items-center gap-1.5">
									<Settings2 className="w-3.5 h-3.5 text-neutral-500" />
									<span className="body-2 font-semibold text-neutral-800">Advanced Settings</span>
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
								{advancedSettings.map((item) => {
									const key = item.name as keyof typeof formData;
									if (item.type === "date") {
										return (
											<DateInput
												key={item.name}
												{...item}
												value={formData[key] ? new Date(formData[key] as string) : undefined}
												onChange={(date) => updateForm(key, date?.toISOString() ?? "")}
												errorMessage={errors[key]}
												floatingLabel
												required={item.required}
											/>
										);
									}
									if (item.type === "time") {
										return (
											<TimeInput
												key={item.name}
												{...item}
												modal
												floatingLabel
												value={formData[key] as string}
												onChange={(time) => updateForm(key, time)}
											/>
										);
									}
									return (
										<Input
											key={item.name}
											{...item}
											value={formData[key] as string}
											onChange={(e) => updateForm(key, e.target.value)}
											errorMessage={errors[key]}
											floatingLabel
											required={item.required}
										/>
									);
								})}
							</div>
						</CollapsibleContent>
					</Collapsible>
				</form>
			</div>
		</AppDrawer>
	);
}
