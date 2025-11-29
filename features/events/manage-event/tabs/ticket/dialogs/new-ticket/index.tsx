import AppDrawer from "@/components/app/app-drawer";
import React from "react";
import { ticketTypes } from "../../data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useNewTicket from "./use-new-ticket";
import { formFields } from "./data";
import { DateInput, Input, SelectBox, Textarea } from "@/components/app/form-input";
import AppCheckbox from "@/components/app/app-checkbox";
import { InfoIcon } from "lucide-react";
import AppTooltip from "@/components/app/app-tooltip";
import AppSwitch from "@/components/app/app-switch";
import TimeInput from "@/components/app/form-input/time-input";
import AppButton from "@/components/app/app-button";
import AppHoverCard from "@/components/app/app-hover-card";
import getFeeBreakdown from "@/services/events/event-tickets/get-fee-breakdown";

export default function NewTicket() {
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

	const fetchFeeBreakdown = async () => {
		if (!formData.price || !formData.currency_id) return;
		try {
			setFeeError(null);
			setFeeLoading(true);
			const priceNum = Number(String(formData.price).replace(/[^0-9.]/g, ""));
			const res = await getFeeBreakdown({
				event_id: "",
				price: priceNum,
				currency_id: formData.currency_id,
			});
			setFeeData(res);
		} catch {
			setFeeError("Failed to load fees");
		} finally {
			setFeeLoading(false);
		}
	};

	return (
		<AppDrawer
			title="Create New Ticket"
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
			<div className="p-4 ">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{ticketTypes.map((item) => (
						<Card
							key={item.id}
							className={cn(
								"p-2 flex items-center  gap-2 hover:bg-badge/10 cursor-pointer transition-all duration-300",
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

				<form className="py-4 space-y-8">
					
						<div className="border-b border-neutral-200">
							<h5 className="body-2 font-medium text-neutral-500">{ticketInfo[0].section}</h5>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{ticketInfo.map((item) => {
								const key = item.name as keyof typeof formData;

								if (item.name === "price") {
									const floatingComponent = (
										<SelectBox
											containerStyle="!border-none !border-0 !outline-none"
											className="!outline-none !outline-0 border p-0 "
											options={currencyOptions}
											value={selectedCurrency.id}
											onchange={(e) => updateForm("currency_id", e)}
										/>
									);
									return (
										<div className="flex flex-col gap-0 col-span-full" key={item.name}>
											<Input
												{...item}
												value={`${selectedCurrency.symbol} ${formData[key] ?? ""}`}
												onChange={(e) => updateForm(key, e.target.value)}
												errorMessage={errors[key]}
												floatingLabel
												floatingComponent={floatingComponent}
												disabled={formData.type == "free" || formData.type == "donation"}
												required={item.required}
											/>
											<div className="flex flex-col gap-">
												{formData.price && formData?.price?.toString().length > 0 ? (
													<div className="flex justify-between">
														<p className="body-3 text-neutral-500">Attendee to pay:</p>
														<AppHoverCard
															trigger={
																<button
																	onMouseEnter={fetchFeeBreakdown}
																	className="body-3 text-primary-500 underline"
																	type="button"
																>
																	view fee breakdown
																</button>
															}
															side="left"
														>
															<div className="min-w-[220px]">
																{feeLoading ? (
																	<p className="body-3 text-neutral-500">Loading...</p>
																) : feeError ? (
																	<p className="body-3 text-red-500">{feeError}</p>
																) : feeData ? (
																	<div className="space-y-1 body-3 text-neutral-700">
																		<div className="flex justify-between">
																			<span>Currency</span>
																			<span>{feeData.currency.symbol}</span>
																		</div>
																		<div className="flex justify-between">
																			<span>Service fee</span>
																			<span>{feeData.service_fee.amount}</span>
																		</div>
																		<div className="flex justify-between">
																			<span>Processing fee</span>
																			<span>{feeData.processing_fee.amount}</span>
																		</div>
																		<div className="flex justify-between">
																			<span>Total fee</span>
																			<span>{feeData.total_fee}</span>
																		</div>
																		<div className="flex justify-between font-medium">
																			<span>Net amount</span>
																			<span>{feeData.net_amount}</span>
																		</div>
																	</div>
																) : (
																	<p className="body-3 text-neutral-500">No data</p>
																)}
															</div>
														</AppHoverCard>
													</div>
												) : null}

												<div className="flex gap-2">
													<label
														htmlFor="absolve-fee"
														className="body-3 flex  items-center gap-1 text-neutral-500"
													>
														Absolve Fee{" "}
														<AppTooltip trigger={<InfoIcon className="w-4 h-4" />}>
															<p className="body-3 text-neutral-100">
																{formData.absolve_fee == true
																	? "Uncheck this to include the fee in the ticket price."
																	: "Check this to absolve the fee from the ticket price."}
															</p>
														</AppTooltip>
													</label>
													<AppCheckbox
														id="absolve-fee"
														checked={formData.absolve_fee == true}
														onCheckedChange={(checked) =>
															updateForm("absolve_fee", checked == true ? "true" : "false")
														}
													/>
												</div>
											</div>
										</div>
									);
								}

								if (item.name === "perks") {
									return (
										<div className="flex flex-col gap-1 col-span-full" key={item.name}>
											<Textarea
												{...item}
												value={formData[key] as string}
												onChange={(e) => updateForm(key, e.target.value)}
												errorMessage={errors[key]}
												floatingLabel
												required={item.required}
												rows={Math.ceil(
													formData.perks.split(",").filter((item) => item.trim().length > 0)
														.length / 3
												)}
											/>
											<div className="flex gap-x-2 gap-y-1 flex-wrap">
												{formData.perks
													.split(",")
													.filter((item) => item.trim().length > 0)
													.slice(0, 5)
													.map((perk, idx) => (
														<Badge
															key={idx}
															variant={"outline"}
															className="body-3 bg-neutral-100 shadow-sm text-neutral-500 px-1"
														>
															<p className="body-3 text-neutral-500">{perk}</p>
														</Badge>
													))}
												{formData.perks.split(",").filter((item) => item.trim().length > 0).length >
													5 && (
													<AppHoverCard
														side="left"
														trigger={
															<Badge
																variant={"outline"}
																className="body-3 bg-neutral-100 shadow-sm text-neutral-500 px-1 cursor-pointer"
															>
																<p className="body-3 text-neutral-500">
																	+
																	{formData.perks
																		.split(",")
																		.filter((item) => item.trim().length > 0).length - 5}
																</p>
															</Badge>
														}
													>
														<div className="flex flex-wrap gap-1">
															{formData.perks
																.split(",")
																.filter((item) => item.trim().length > 0)

																.map((perk, idx) => (
																	<Badge
																		key={idx}
																		variant={"outline"}
																		className="body-3 bg-neutral-100 shadow-sm text-neutral-500 px-1"
																	>
																		<p className="body-3 text-neutral-500">{perk}</p>
																	</Badge>
																))}
														</div>
													</AppHoverCard>
												)}
											</div>
										</div>
									);
								}
								if (item.name === "total_quantity") {
									return (
										<div className="flex flex-col gap-1 col-span-full" key={item.name}>
											<Input
												key={item.name}
												{...item}
												value={formData[key] as string}
												onChange={(e) => updateForm(key, e.target.value)}
												errorMessage={errors[key]}
												floatingLabel
												required={item.required}
												disabled={formData.unlimited_quantity == true}
											/>
											<div className="flex justify-between items-center">
												<label
													htmlFor="unlimited-quantity"
													className="body-3 flex  items-center gap-1 text-neutral-500"
												>
													Mark as unlimited
												</label>

												{/* TODO: make the toggle work  */}
												<AppSwitch
													id="unlimited-quantity"
													checked={formData.unlimited_quantity == true}
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

						<div className="border-b border-neutral-200">
							<h5 className="body-2 font-medium text-neutral-500">{advancedSettings[0].section}</h5>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
					
				</form>
			</div>
		</AppDrawer>
	);
}
