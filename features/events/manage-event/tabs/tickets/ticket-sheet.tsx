"use client";
import * as React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import Field, { controlClass, controlProps } from "@/components/app/field";
import RestoreBanner from "@/components/app/restore-banner";
import SelectField from "@/components/app/select-field";
import useSavedForm from "@/hooks/use-saved-form";
import ensureError from "@/lib/ensure-error";
import addEventTicket from "@/services/events/event-tickets/add-event-ticket";
import toggleTicketStatus from "@/services/events/event-tickets/toggle-ticket-status";
import updateEventTicket from "@/services/events/event-tickets/update-event-ticket";
import { EventTicket, EventTicketType } from "@/types/event-ticket.types";
import DateTimeField from "../basic-info/date-time-field";
import FeeModes, { FeeMode } from "./fee-modes";
import { commas, koboToDigits, nairaFromKobo, toKobo } from "./format";
import {
	endHint,
	endOptions,
	NEW_WINDOW,
	readWindow,
	startOptions,
	Window,
	windowErrors,
	windowPayload,
} from "./sales-window";
import { totalOf } from "./ticket-status";
import { CheckRow, fixMessage, KindCards, NumberInput, Sheet, SwitchRow } from "./ui";
import { TicketsData } from "./use-tickets";

const KINDS: { value: EventTicketType; title: string; detail: string }[] = [
	{ value: "paid", title: "Paid", detail: "Guests pay the price you set." },
	{ value: "free", title: "Free", detail: "No charge. Guests still get a ticket." },
	{ value: "donation", title: "Donation", detail: "Guests choose how much to give." },
];

const NOTE_MAX = 150;

type Form = {
	kind: EventTicketType;
	name: string;
	price: string;
	feeMode: FeeMode;
	qty: string;
	unlimited: boolean;
	window: Window;
	maxPer: string;
	perks: string[];
	perkDraft: string;
	note: string;
	selling: boolean;
};

const blank = (name: string): Form => ({
	kind: "paid",
	name,
	price: "",
	feeMode: "absorb",
	qty: "",
	unlimited: false,
	window: NEW_WINDOW,
	maxPer: "",
	perks: [],
	perkDraft: "",
	note: "",
	selling: true,
});

const fromTicket = (ticket: EventTicket, times: TicketsData["times"]): Form => ({
	kind: ticket.type,
	name: ticket.name,
	price: ticket.type === "paid" ? koboToDigits(ticket.price) : "",
	feeMode: ticket.absolve_fee ? "absorb" : "top",
	qty: ticket.unlimited_quantity || !ticket.total_quantity ? "" : String(ticket.total_quantity),
	unlimited: ticket.unlimited_quantity,
	window: readWindow(ticket, times),
	maxPer: ticket.maximum_quantity ? String(ticket.maximum_quantity) : "",
	perks: ticket.perks ?? [],
	perkDraft: "",
	note: ticket.description ?? "",
	selling: ticket.is_active,
});

/** `ticket` stays set while the panel closes, so its title doesn’t flip mid-animation. */
export type TicketSheetState = { open: boolean; ticket: EventTicket | null; name?: string };

type TicketSheetProps = {
	state: TicketSheetState;
	onClose: () => void;
	data: TicketsData;
	eventId: string;
	eventTitle: string;
	onRemove: (ticket: EventTicket) => void;
};

export default function TicketSheet({ state, onClose, data, eventId, eventTitle, onRemove }: TicketSheetProps) {
	const { times, rates, sold: soldById, currencyId, refresh } = data;
	const ticket = state.ticket;
	const sold = ticket ? (soldById.get(ticket.id) ?? 0) : 0;
	const [tried, setTried] = React.useState(false);
	const [isSaving, setIsSaving] = React.useState(false);

	// The form starts over each time the panel opens. What's typed is kept on the device until it's saved,
	// so a panel closed by accident (or a closed tab) offers it back next time.
	const openKey = state.open ? `${state.ticket?.id ?? "new"}:${state.name ?? ""}` : null;
	const server = React.useMemo(
		() => (openKey ? (state.ticket ? fromTicket(state.ticket, times) : blank(state.name ?? "")) : null),
		[openKey] // eslint-disable-line react-hooks/exhaustive-deps
	);
	const panel = useSavedForm<Form>({
		server,
		resetKey: openKey ?? "closed",
		mode: "manual",
		backup: `ticket-type:${eventId}:${ticket?.id ?? "new"}`,
	});
	const form = panel.values ?? blank("");
	const setForm = panel.setValues;
	React.useEffect(() => {
		if (openKey) setTried(false);
	}, [openKey]);

	const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }));
	const setWindow = (patch: Partial<Window>) => setForm((prev) => ({ ...prev, window: { ...prev.window, ...patch } }));

	const price = Number(form.price || 0);
	const qty = Number(form.qty || 0);
	const errors: Record<string, string | undefined> = {};
	if (tried) {
		if (!form.name.trim()) errors.name = "Give it a name.";
		if (form.kind === "paid" && !price) errors.price = "Enter a price, or make it free.";
		if (!form.unlimited && !qty) errors.qty = "Enter how many, or choose No limit.";
		else if (!form.unlimited && qty < sold)
			errors.qty = `It can’t be lower than ${commas(sold)}, the number already sold.`;
		const windowErr = windowErrors(form.window, times);
		errors.start = windowErr.start;
		errors.end = windowErr.end;
	}
	const errorCount = Object.values(errors).filter(Boolean).length;

	const addPerk = () => {
		const perk = form.perkDraft.trim();
		if (perk && !form.perks.includes(perk))
			setForm((prev) => ({ ...prev, perks: [...prev.perks, perk], perkDraft: "" }));
		else set("perkDraft", "");
	};

	const submit = async () => {
		const problems =
			!form.name.trim() ||
			(form.kind === "paid" && !price) ||
			(!form.unlimited && (!qty || qty < sold)) ||
			Object.keys(windowErrors(form.window, times)).length > 0;
		if (problems) {
			setTried(true);
			return;
		}

		const kept = ticket ? readWindow(ticket, times) : null;
		const payload = {
			type: form.kind,
			name: form.name.trim(),
			description: form.note.trim(),
			// Free and donation tickets have no price of their own.
			price: form.kind === "paid" ? toKobo(form.price) : 0,
			currency_id: form.kind === "free" ? null : currencyId,
			minimum_quantity: 1,
			// 0 clears a saved most per order
			maximum_quantity: form.maxPer ? Number(form.maxPer) : 0,
			total_quantity: form.unlimited ? null : qty,
			unlimited_quantity: form.unlimited,
			perks: form.perks,
			absolve_fee: form.feeMode === "absorb",
			...windowPayload(form.window, times, kept),
		};

		setIsSaving(true);
		try {
			if (ticket) {
				await updateEventTicket({ id: ticket.id, ...payload });
				if (form.selling !== ticket.is_active) {
					await toggleTicketStatus({ id: ticket.id, eventId, is_active: form.selling });
				}
				toast.success("Saved.");
			} else {
				// New ticket types start off on the server, so turn this one on when it should sell.
				const created = await addEventTicket({ event_id: eventId, ...payload });
				if (form.selling) await toggleTicketStatus({ id: created.id, eventId, is_active: true });
				toast.success(`${payload.name} added.`);
			}
			panel.markSaved();
			refresh();
			onClose();
		} catch (error) {
			toast.error(ensureError(error).message);
			refresh();
		} finally {
			setIsSaving(false);
		}
	};

	const published = times.published;
	const sellingDetail = form.selling
		? ticket && published && ticket.is_active
			? "On sale now. Turning it off stops new orders. Tickets already bought aren’t affected."
			: published
				? "It goes on sale as soon as you save."
				: "It goes on sale when you publish the event."
		: "It stays off. Guests can’t buy it until you turn it on.";

	const hint = endHint(form.window, times);
	const priceNote =
		ticket && sold > 0 && ticket.type === "paid" && ticket.price
			? `${commas(sold)} ${sold === 1 ? "person" : "people"} bought this at ${nairaFromKobo(ticket.price)}. A new price only applies to new orders.`
			: undefined;

	return (
		<Sheet
			open={state.open}
			onClose={onClose}
			title={ticket ? "Edit ticket type" : "Add a ticket type"}
			subtitle={ticket ? `${ticket.name} · ${soldLine(sold, totalOf(ticket))}` : eventTitle}
			footNote={fixMessage(errorCount)}
			submitLabel={ticket ? "Save changes" : "Add ticket type"}
			isSaving={isSaving}
			onSubmit={submit}
		>
			{panel.offer && (
				<RestoreBanner
					variant={ticket ? "changes" : "started"}
					savedAt={panel.offer.savedAt}
					onRestore={panel.restore}
					onDiscard={panel.discard}
				/>
			)}
			<KindCards
				name="ticket-kind"
				legend="What guests pay"
				value={form.kind}
				choices={KINDS}
				onChange={(kind) => set("kind", kind)}
			/>

			<Field id="ticket-name" label="Ticket name" error={errors.name}>
				<input
					{...controlProps("ticket-name", { error: errors.name })}
					type="text"
					autoComplete="off"
					placeholder="Like Regular, VIP or Table for four"
					value={form.name}
					onChange={(event) => set("name", event.target.value)}
					className={controlClass(Boolean(errors.name), "h-11")}
				/>
			</Field>

			{form.kind === "paid" && (
				<>
					<div className="grid gap-1.5">
						<Field id="ticket-price" label="Price" error={errors.price}>
							<NumberInput
								{...controlProps("ticket-price", { error: errors.price })}
								aria-describedby={
									[errors.price && "ticket-price-message", priceNote && "ticket-price-note"]
										.filter(Boolean)
										.join(" ") || undefined
								}
								prefix="₦"
								placeholder="0"
								value={form.price}
								onChange={(value) => set("price", value)}
							/>
						</Field>
						{priceNote && (
							<p id="ticket-price-note" className="text-[13px] leading-[1.45] text-auth-muted">
								{priceNote}
							</p>
						)}
					</div>
					<FeeModes price={price} rates={rates} value={form.feeMode} onChange={(mode) => set("feeMode", mode)} />
				</>
			)}

			{form.kind === "donation" && (
				<p className="rounded-xl bg-auth-page px-3.5 py-3 text-[14px] leading-normal text-auth-muted">
					Guests choose how much to give when they get this ticket.
				</p>
			)}

			<Field id="ticket-qty" label="How many" error={errors.qty}>
				<NumberInput
					{...controlProps("ticket-qty", { error: errors.qty })}
					placeholder="Number of tickets"
					value={form.unlimited ? "" : form.qty}
					onChange={(value) => set("qty", value)}
					disabled={form.unlimited}
				/>
				<CheckRow checked={form.unlimited} onChange={() => set("unlimited", !form.unlimited)}>
					No limit
				</CheckRow>
			</Field>

			<Field id="ticket-start" label="Sales start" error={errors.start}>
				<SelectField
					{...controlProps("ticket-start", {})}
					value={form.window.startMode}
					options={startOptions(published)}
					onChange={(value) => setWindow({ startMode: value as Window["startMode"] })}
					placeholder="Pick when sales start"
				/>
				{form.window.startMode === "pick" && (
					<DateTimeField
						id="ticket-start-at"
						aria-invalid={Boolean(errors.start) || undefined}
						aria-describedby={errors.start ? "ticket-start-message" : undefined}
						aria-label="Sales start date and time"
						kind="start"
						value={form.window.start}
						onChange={(start) => setWindow({ start })}
						placeholder="Pick a date and time"
					/>
				)}
			</Field>

			<Field id="ticket-end" label="Sales end" error={errors.end} hint={hint}>
				<SelectField
					{...controlProps("ticket-end", { error: form.window.endMode === "pick" ? undefined : errors.end, hint })}
					value={form.window.endMode}
					options={endOptions(times)}
					onChange={(value) => setWindow({ endMode: value as Window["endMode"] })}
					placeholder="Pick when sales end"
				/>
				{form.window.endMode === "pick" && (
					<DateTimeField
						id="ticket-end-at"
						aria-invalid={Boolean(errors.end) || undefined}
						aria-describedby={errors.end || hint ? "ticket-end-message" : undefined}
						aria-label="Sales end date and time"
						kind="end"
						value={form.window.end}
						onChange={(end) => setWindow({ end })}
						placeholder="Pick a date and time"
					/>
				)}
			</Field>

			<Field id="ticket-max" label="Most per order" optional>
				<NumberInput
					{...controlProps("ticket-max", {})}
					placeholder="No limit"
					value={form.maxPer}
					onChange={(value) => set("maxPer", value)}
				/>
			</Field>

			<Field id="ticket-perk" label="What’s included" optional>
				{form.perks.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{form.perks.map((perk) => (
							<span
								key={perk}
								className="inline-flex h-[30px] items-center gap-1 rounded-full bg-auth-info-soft pl-2.5 pr-1 text-[13px] font-semibold text-primary-500"
							>
								{perk}
								<button
									type="button"
									aria-label={`Remove ${perk}`}
									onClick={() =>
										set(
											"perks",
											form.perks.filter((item) => item !== perk)
										)
									}
									className="grid size-6 place-items-center rounded-full hover:bg-white"
								>
									<X aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
								</button>
							</span>
						))}
					</div>
				)}
				<input
					{...controlProps("ticket-perk", {})}
					type="text"
					autoComplete="off"
					placeholder="Like a welcome drink. Press Enter to add it."
					value={form.perkDraft}
					onChange={(event) => set("perkDraft", event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							addPerk();
						}
					}}
					onBlur={addPerk}
					className={controlClass(false, "h-11")}
				/>
			</Field>

			<Field
				id="ticket-note"
				label="Note for guests"
				optional
				aside={
					<span className="text-[12px] text-auth-muted">
						{form.note.length} / {NOTE_MAX}
					</span>
				}
			>
				<textarea
					{...controlProps("ticket-note", {})}
					rows={2}
					maxLength={NOTE_MAX}
					placeholder="Anything guests should know before they pick this ticket."
					value={form.note}
					onChange={(event) => set("note", event.target.value.slice(0, NOTE_MAX))}
					className={controlClass(false, "resize-y py-2.5 leading-normal")}
				/>
			</Field>

			<SwitchRow
				id="ticket-selling"
				title="Sell this ticket type"
				detail={sellingDetail}
				on={form.selling}
				onChange={() => set("selling", !form.selling)}
			/>

			{ticket &&
				(sold > 0 ? (
					<p className="text-[13px] leading-[1.45] text-auth-muted">
						{ticket.name} has sales, so it can’t be removed. Turn it off to stop selling it.
					</p>
				) : (
					<button
						type="button"
						onClick={() => onRemove(ticket)}
						className="self-start text-[14px] font-semibold text-auth-error hover:text-auth-error-ink"
					>
						Remove ticket type
					</button>
				))}
		</Sheet>
	);
}

/** "98 of 150 sold" or "12 sold" when there's no limit. */
export const soldLine = (sold: number, total: number | null) =>
	total === null ? `${commas(sold)} sold` : `${commas(sold)} of ${commas(total)} sold`;
