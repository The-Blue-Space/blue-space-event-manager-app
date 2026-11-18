"use client";
import * as React from "react";
import classNames from "classnames";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import Field, { controlClass, controlProps } from "@/components/app/field";
import RestoreBanner from "@/components/app/restore-banner";
import SelectField from "@/components/app/select-field";
import useSavedForm from "@/hooks/use-saved-form";
import ensureError from "@/lib/ensure-error";
import addTicketPromo from "@/services/events/event-ticket-promos/add-ticket-promo";
import updateTicketPromo from "@/services/events/event-ticket-promos/update-ticket-promo";
import { EventTicket, EventTicketPromo, PromoType } from "@/types/event-ticket.types";
import DateTimeField from "../basic-info/date-time-field";
import { koboToDigits, naira, nairaFromKobo, toKobo } from "./format";
import { endOptions, NEW_WINDOW, readWindow, startOptions, Window, windowErrors, windowPayload } from "./sales-window";
import { fixMessage, KindCards, NumberInput, Sheet, SwitchRow } from "./ui";
import { TicketsData } from "./use-tickets";

const KINDS: { value: PromoType; title: string; detail: string }[] = [
	{ value: "discount", title: "Money off", detail: "A percentage or an amount off the price." },
	{ value: "free_ticket", title: "Free tickets", detail: "Free tickets when guests buy a few." },
];

type OffType = "percentage" | "fixed";

type Form = {
	ticketId: string;
	kind: PromoType;
	offType: OffType;
	off: string;
	buy: string;
	free: string;
	name: string;
	window: Window;
	maxPer: string;
	note: string;
	on: boolean;
};

const blank = (ticketId: string): Form => ({
	ticketId,
	kind: "discount",
	offType: "percentage",
	off: "",
	buy: "",
	free: "",
	name: "",
	window: NEW_WINDOW,
	maxPer: "",
	note: "",
	on: true,
});

const fromPromo = (promo: EventTicketPromo, times: TicketsData["times"]): Form => ({
	ticketId: promo.ticket_id,
	kind: promo.promo_type,
	offType: promo.discount_type === "fixed" ? "fixed" : "percentage",
	off:
		promo.discount_type === "fixed"
			? koboToDigits(promo.discount_amount)
			: promo.discount_percentage
				? String(promo.discount_percentage)
				: "",
	buy: promo.min_purchase_quantity ? String(promo.min_purchase_quantity) : "",
	free: promo.free_ticket_quantity ? String(promo.free_ticket_quantity) : "",
	name: promo.name,
	window: readWindow(promo, times),
	maxPer: promo.promo_type === "discount" && promo.max_purchase_quantity ? String(promo.max_purchase_quantity) : "",
	note: promo.note ?? "",
	on: promo.is_active,
});

/** "20% off", "₦2,000 off" or "Buy 4, get 1 free". */
export function promoSummary(promo: EventTicketPromo) {
	if (promo.promo_type === "free_ticket") {
		return `Buy ${promo.min_purchase_quantity ?? 1}, get ${promo.free_ticket_quantity} free`;
	}
	return promo.discount_type === "fixed"
		? `${nairaFromKobo(promo.discount_amount)} off`
		: `${promo.discount_percentage}% off`;
}

export type DiscountSheetState = { open: boolean; promo: EventTicketPromo | null };

type DiscountSheetProps = {
	state: DiscountSheetState;
	onClose: () => void;
	data: TicketsData;
	eventId: string;
	eventTitle: string;
	/** Paid ticket types this discount can go on. */
	ticketTypes: EventTicket[];
};

export default function DiscountSheet({ state, onClose, data, eventId, eventTitle, ticketTypes }: DiscountSheetProps) {
	const { times, refresh } = data;
	const promo = state.promo;
	const [tried, setTried] = React.useState(false);
	const [isSaving, setIsSaving] = React.useState(false);

	// Starts over on each open; unsaved typing is kept on the device and offered back (see useSavedForm).
	const openKey = state.open ? (state.promo?.id ?? "new") : null;
	const server = React.useMemo(
		() =>
			openKey
				? state.promo
					? fromPromo(state.promo, times)
					: blank(ticketTypes.length === 1 ? ticketTypes[0].id : "")
				: null,
		[openKey] // eslint-disable-line react-hooks/exhaustive-deps
	);
	const panel = useSavedForm<Form>({
		server,
		resetKey: openKey ?? "closed",
		mode: "manual",
		backup: `discount:${eventId}:${promo?.id ?? "new"}`,
	});
	const form = panel.values ?? blank("");
	const setForm = panel.setValues;
	React.useEffect(() => {
		if (openKey) setTried(false);
	}, [openKey]);

	const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }));
	const setWindow = (patch: Partial<Window>) => setForm((prev) => ({ ...prev, window: { ...prev.window, ...patch } }));

	const ticket = ticketTypes.find((item) => item.id === form.ticketId) ?? null;
	const price = ticket?.price ? ticket.price / 100 : 0;
	const off = Number(form.off || 0);
	const buy = Number(form.buy || 0);
	const free = Number(form.free || 0);

	const check = () => {
		const errors: Record<string, string | undefined> = {};
		if (!form.ticketId) errors.ticket = "Pick a ticket type.";
		if (form.kind === "discount") {
			if (!off) errors.off = "Enter how much off.";
			else if (form.offType === "percentage" && off > 100) errors.off = "It can’t be more than 100%.";
			else if (form.offType === "fixed" && price && off >= price)
				errors.off = `It has to be less than ${naira(price)}.`;
		} else {
			if (!buy) errors.buy = "Enter how many guests buy.";
			if (!free) errors.free = "Enter how many they get free.";
		}
		if (!form.name.trim()) errors.name = "Give it a name.";
		const windowErr = windowErrors(form.window, times);
		errors.start = windowErr.start;
		errors.end = windowErr.end;
		return errors;
	};
	const errors = tried ? check() : {};
	const errorCount = Object.values(errors).filter(Boolean).length;

	const offHint =
		form.kind === "discount" && ticket && price && off && !errors.off
			? `${ticket.name} costs ${naira(form.offType === "percentage" ? (price * (100 - Math.min(off, 100))) / 100 : Math.max(price - off, 0))} while this runs.`
			: undefined;
	const freeHint =
		form.kind === "free_ticket" && ticket && buy && free
			? `Buy ${buy} ${ticket.name} tickets, get ${free} more free.`
			: undefined;

	const submit = async () => {
		if (Object.values(check()).some(Boolean)) {
			setTried(true);
			return;
		}
		const kept = promo ? readWindow(promo, times) : null;
		const window = windowPayload(form.window, times, kept);
		const isDiscount = form.kind === "discount";
		const payload = {
			ticket_id: form.ticketId,
			promo_type: form.kind,
			name: form.name.trim(),
			note: form.note.trim(),
			discount_type: isDiscount ? form.offType : ("none" as const),
			discount_percentage: isDiscount && form.offType === "percentage" ? off : 0,
			discount_amount: isDiscount && form.offType === "fixed" ? toKobo(form.off) : 0,
			// The server asks money-off discounts for these too; they match the window.
			discount_start_date: window.sales_start_date,
			discount_end_date: window.sales_end_date,
			min_purchase_quantity: isDiscount ? null : buy,
			free_ticket_quantity: isDiscount ? 0 : free,
			max_purchase_quantity: isDiscount && form.maxPer ? Number(form.maxPer) : null,
			is_active: form.on,
			...window,
		};

		setIsSaving(true);
		try {
			if (promo) {
				await updateTicketPromo({ promoId: promo.id, ...payload });
				toast.success("Saved.");
			} else {
				await addTicketPromo(payload);
				toast.success(`${payload.name} added.`);
			}
			refresh();
			panel.markSaved();
			onClose();
		} catch (error) {
			toast.error(ensureError(error).message);
		} finally {
			setIsSaving(false);
		}
	};

	const published = times.published;

	return (
		<Sheet
			open={state.open}
			onClose={onClose}
			title={promo ? "Edit discount" : "Add a discount"}
			subtitle={eventTitle}
			footNote={fixMessage(errorCount)}
			submitLabel={promo ? "Save changes" : "Add discount"}
			isSaving={isSaving}
			onSubmit={submit}
		>
			{panel.offer && (
				<RestoreBanner
					variant={promo ? "changes" : "started"}
					savedAt={panel.offer.savedAt}
					onRestore={panel.restore}
					onDiscard={panel.discard}
				/>
			)}
			<Field id="discount-ticket" label="Ticket type" error={errors.ticket}>
				<SelectField
					{...controlProps("discount-ticket", { error: errors.ticket })}
					value={form.ticketId}
					options={ticketTypes.map((item) => ({
						value: item.id,
						label: `${item.name} · ${nairaFromKobo(item.price ?? 0)}`,
					}))}
					onChange={(value) => set("ticketId", value)}
					placeholder="Pick a ticket type"
					disabled={Boolean(promo)}
				/>
			</Field>

			<KindCards
				name="discount-kind"
				legend="Kind of discount"
				value={form.kind}
				choices={KINDS}
				onChange={(kind) => set("kind", kind)}
			/>

			{form.kind === "discount" ? (
				<fieldset className="grid gap-1.5">
					<legend className="mb-1.5 text-[13px] font-semibold text-auth-ink">How much off</legend>
					<div className="flex gap-2">
						<div
							role="radiogroup"
							aria-label="Percentage or amount"
							className="flex shrink-0 rounded-lg border border-auth-field p-0.5"
						>
							{(
								[
									["percentage", "Percent"],
									["fixed", "Amount"],
								] as const
							).map(([value, label]) => (
								<button
									key={value}
									type="button"
									role="radio"
									aria-checked={form.offType === value}
									onClick={() => setForm((prev) => ({ ...prev, offType: value, off: "" }))}
									className={classNames(
										"h-[38px] rounded-md px-3 text-[14px] font-semibold transition-colors",
										form.offType === value ? "bg-primary-500 text-white" : "text-auth-muted hover:text-auth-ink"
									)}
								>
									{label}
								</button>
							))}
						</div>
						<div className="min-w-0 flex-1">
							<NumberInput
								{...controlProps("discount-off", { error: errors.off, hint: offHint })}
								aria-label={form.offType === "percentage" ? "Percentage off" : "Amount off"}
								prefix={form.offType === "fixed" ? "₦" : undefined}
								suffix={form.offType === "percentage" ? "%" : undefined}
								placeholder="0"
								value={form.off}
								onChange={(value) => set("off", value)}
							/>
						</div>
					</div>
					<FieldMessage id="discount-off" error={errors.off} hint={offHint} />
				</fieldset>
			) : (
				<>
					<Field id="discount-buy" label="Guests buy at least" error={errors.buy}>
						<NumberInput
							{...controlProps("discount-buy", { error: errors.buy })}
							placeholder="Number of tickets"
							value={form.buy}
							onChange={(value) => set("buy", value)}
						/>
					</Field>
					<Field id="discount-free" label="They get free" error={errors.free} hint={freeHint}>
						<NumberInput
							{...controlProps("discount-free", { error: errors.free, hint: freeHint })}
							placeholder="Number of tickets"
							value={form.free}
							onChange={(value) => set("free", value)}
						/>
					</Field>
				</>
			)}

			<Field id="discount-name" label="Name guests see" error={errors.name}>
				<input
					{...controlProps("discount-name", { error: errors.name })}
					type="text"
					autoComplete="off"
					placeholder="Like Weekday deal"
					value={form.name}
					onChange={(event) => set("name", event.target.value)}
					className={controlClass(Boolean(errors.name), "h-11")}
				/>
			</Field>

			<Field id="discount-start" label="Starts" error={errors.start}>
				<SelectField
					{...controlProps("discount-start", {})}
					value={form.window.startMode}
					options={startOptions(published)}
					onChange={(value) => setWindow({ startMode: value as Window["startMode"] })}
					placeholder="Pick when it starts"
				/>
				{form.window.startMode === "pick" && (
					<DateTimeField
						id="discount-start-at"
						aria-invalid={Boolean(errors.start) || undefined}
						aria-describedby={errors.start ? "discount-start-message" : undefined}
						aria-label="Discount start date and time"
						kind="start"
						value={form.window.start}
						onChange={(start) => setWindow({ start })}
						placeholder="Pick a date and time"
					/>
				)}
			</Field>

			<Field id="discount-end" label="Ends" error={errors.end}>
				<SelectField
					{...controlProps("discount-end", { error: form.window.endMode === "pick" ? undefined : errors.end })}
					value={form.window.endMode}
					options={endOptions(times)}
					onChange={(value) => setWindow({ endMode: value as Window["endMode"] })}
					placeholder="Pick when it ends"
				/>
				{form.window.endMode === "pick" && (
					<DateTimeField
						id="discount-end-at"
						aria-invalid={Boolean(errors.end) || undefined}
						aria-describedby={errors.end ? "discount-end-message" : undefined}
						aria-label="Discount end date and time"
						kind="end"
						value={form.window.end}
						onChange={(end) => setWindow({ end })}
						placeholder="Pick a date and time"
					/>
				)}
			</Field>

			{form.kind === "discount" && (
				<Field id="discount-max" label="Most per order at this price" optional>
					<NumberInput
						{...controlProps("discount-max", {})}
						placeholder="No limit"
						value={form.maxPer}
						onChange={(value) => set("maxPer", value)}
					/>
				</Field>
			)}

			<Field id="discount-note" label="Note for your team" optional>
				<textarea
					{...controlProps("discount-note", {})}
					rows={2}
					placeholder="Only you and your team see this."
					value={form.note}
					onChange={(event) => set("note", event.target.value)}
					className={controlClass(false, "resize-y py-2.5 leading-normal")}
				/>
			</Field>

			<SwitchRow
				id="discount-on"
				title="Turn on this discount"
				detail={
					form.on
						? published
							? "Guests get it as soon as you save."
							: "Guests get it once you publish."
						: "It stays off. Guests don’t get it until you turn it on."
				}
				on={form.on}
				onChange={() => set("on", !form.on)}
			/>
		</Sheet>
	);
}

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
	if (error) {
		return (
			<p id={`${id}-message`} className="flex items-start gap-1.5 text-[13px] leading-[1.45] text-auth-error">
				<CircleAlert aria-hidden="true" className="mt-px size-[15px] shrink-0" />
				<span>{error}</span>
			</p>
		);
	}
	if (hint) {
		return (
			<p id={`${id}-message`} className="text-[13px] leading-[1.45] text-auth-muted">
				{hint}
			</p>
		);
	}
	return null;
}
