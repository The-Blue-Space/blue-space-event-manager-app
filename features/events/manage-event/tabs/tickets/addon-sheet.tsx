"use client";
import * as React from "react";
import classNames from "classnames";
import { toast } from "sonner";
import Field, { controlClass, controlProps } from "@/components/app/field";
import RestoreBanner from "@/components/app/restore-banner";
import SelectField from "@/components/app/select-field";
import useSavedForm from "@/hooks/use-saved-form";
import ensureError from "@/lib/ensure-error";
import addEventAddon from "@/services/events/event-addons/add-event-addon";
import updateEventAddon from "@/services/events/event-addons/update-event-addon";
import { EventTicket, EventTicketAddon, EventTicketType } from "@/types/event-ticket.types";
import DateTimeField from "../basic-info/date-time-field";
import { koboToDigits, toKobo } from "./format";
import { endOptions, NEW_WINDOW, readWindow, startOptions, Window, windowErrors, windowPayload } from "./sales-window";
import { CheckRow, fixMessage, KindCards, NumberInput, Sheet, SwitchRow } from "./ui";
import { TicketsData } from "./use-tickets";

const KINDS: { value: EventTicketType; title: string; detail: string }[] = [
	{ value: "paid", title: "Paid", detail: "Guests pay the price you set." },
	{ value: "free", title: "Free", detail: "Included at no cost." },
	{ value: "donation", title: "Donation", detail: "Guests choose how much to give." },
];

const DESCRIPTION_MAX = 150;

type Who = "tickets" | "anyone";

type Form = {
	kind: EventTicketType;
	name: string;
	price: string;
	description: string;
	who: Who;
	ticketIds: string[];
	qty: string;
	unlimited: boolean;
	window: Window;
	selling: boolean;
};

const blank = (tickets: EventTicket[]): Form => ({
	kind: "paid",
	name: "",
	price: "",
	description: "",
	who: tickets.length ? "tickets" : "anyone",
	ticketIds: tickets.map((ticket) => ticket.id),
	qty: "",
	unlimited: false,
	window: NEW_WINDOW,
	selling: true,
});

const fromAddon = (addon: EventTicketAddon, times: TicketsData["times"]): Form => ({
	kind: addon.type,
	name: addon.name,
	price: addon.type === "paid" ? koboToDigits(addon.price) : "",
	description: addon.description ?? "",
	who: addon.ticket_ids?.length ? "tickets" : "anyone",
	ticketIds: addon.ticket_ids ?? [],
	qty: addon.unlimited_quantity || !addon.total_quantity ? "" : String(addon.total_quantity),
	unlimited: Boolean(addon.unlimited_quantity),
	window: readWindow(addon, times),
	selling: addon.is_active,
});

export type AddonSheetState = { open: boolean; addon: EventTicketAddon | null };

type AddonSheetProps = {
	state: AddonSheetState;
	onClose: () => void;
	data: TicketsData;
	eventId: string;
	eventTitle: string;
};

export default function AddonSheet({ state, onClose, data, eventId, eventTitle }: AddonSheetProps) {
	const { times, tickets, currencyId, refresh } = data;
	const addon = state.addon;
	const [tried, setTried] = React.useState(false);
	const [isSaving, setIsSaving] = React.useState(false);

	// Starts over on each open; unsaved typing is kept on the device and offered back (see useSavedForm).
	const openKey = state.open ? (state.addon?.id ?? "new") : null;
	const server = React.useMemo(
		() => (openKey ? (state.addon ? fromAddon(state.addon, times) : blank(tickets)) : null),
		[openKey] // eslint-disable-line react-hooks/exhaustive-deps
	);
	const panel = useSavedForm<Form>({
		server,
		resetKey: openKey ?? "closed",
		mode: "manual",
		backup: `addon:${eventId}:${addon?.id ?? "new"}`,
	});
	const form = panel.values ?? blank([]);
	const setForm = panel.setValues;
	React.useEffect(() => {
		if (openKey) setTried(false);
	}, [openKey]);

	const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }));
	const setWindow = (patch: Partial<Window>) => setForm((prev) => ({ ...prev, window: { ...prev.window, ...patch } }));
	const toggleTicket = (id: string) =>
		setForm((prev) => ({
			...prev,
			ticketIds: prev.ticketIds.includes(id) ? prev.ticketIds.filter((item) => item !== id) : [...prev.ticketIds, id],
		}));

	const price = Number(form.price || 0);
	const qty = Number(form.qty || 0);

	const check = () => {
		const errors: Record<string, string | undefined> = {};
		if (!form.name.trim()) errors.name = "Give it a name.";
		if (form.kind === "paid" && !price) errors.price = "Enter a price, or make it free.";
		if (form.who === "tickets" && !form.ticketIds.length) errors.who = "Pick at least one ticket type.";
		if (!form.unlimited && !qty) errors.qty = "Enter how many, or choose No limit.";
		const windowErr = windowErrors(form.window, times);
		errors.start = windowErr.start;
		errors.end = windowErr.end;
		return errors;
	};
	const errors = tried ? check() : {};
	const errorCount = Object.values(errors).filter(Boolean).length;

	const submit = async () => {
		if (Object.values(check()).some(Boolean)) {
			setTried(true);
			return;
		}
		const kept = addon ? readWindow(addon, times) : null;
		const payload = {
			event_id: eventId,
			type: form.kind,
			name: form.name.trim(),
			description: form.description.trim(),
			price: form.kind === "paid" ? toKobo(form.price) : 0,
			currency_id: form.kind === "free" ? null : currencyId,
			// An empty list (rather than none) clears the ticket types when one is changed to sell on its own.
			ticket_ids: form.who === "tickets" ? form.ticketIds : addon ? [] : null,
			total_quantity: form.unlimited ? null : qty,
			unlimited_quantity: form.unlimited,
			is_active: form.selling,
			...windowPayload(form.window, times, kept),
		};

		setIsSaving(true);
		try {
			if (addon) {
				await updateEventAddon({ id: addon.id, ...payload });
				toast.success("Saved.");
			} else {
				await addEventAddon(payload);
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
	const sellingDetail = form.selling
		? published
			? "On sale as soon as you save."
			: "It goes on sale when you publish the event."
		: "It stays off. Guests can’t buy it until you turn it on.";

	const whoCard = (who: Who, title: string, detail: string, children?: React.ReactNode) => {
		const checked = form.who === who;
		return (
			<div
				className={classNames(
					"grid gap-3 rounded-xl border px-3.5 py-3 transition-[border-color,box-shadow,background-color] duration-150",
					checked
						? "border-primary-500 bg-auth-page shadow-[0_0_0_1px_#29285C]"
						: "border-auth-line bg-white hover:border-auth-field"
				)}
			>
				<label className="flex cursor-pointer items-start gap-2.5 has-[:focus-visible]:rounded-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-auth-link">
					<input type="radio" name="addon-who" checked={checked} onChange={() => set("who", who)} className="sr-only" />
					<span
						aria-hidden="true"
						className={classNames(
							"mt-0.5 size-4 shrink-0 rounded-full border bg-white",
							checked ? "border-[5px] border-primary-500" : "border-auth-field"
						)}
					/>
					<span className="grid gap-0.5">
						<span className="text-[14px] font-bold text-auth-ink">{title}</span>
						<span className="text-[12.5px] leading-[1.45] text-auth-muted">{detail}</span>
					</span>
				</label>
				{checked && children}
			</div>
		);
	};

	return (
		<Sheet
			open={state.open}
			onClose={onClose}
			title={addon ? "Edit add-on" : "Add an add-on"}
			subtitle={eventTitle}
			footNote={fixMessage(errorCount)}
			submitLabel={addon ? "Save changes" : "Add add-on"}
			isSaving={isSaving}
			onSubmit={submit}
		>
			{panel.offer && (
				<RestoreBanner
					variant={addon ? "changes" : "started"}
					savedAt={panel.offer.savedAt}
					onRestore={panel.restore}
					onDiscard={panel.discard}
				/>
			)}
			<KindCards
				name="addon-kind"
				legend="What guests pay"
				value={form.kind}
				choices={KINDS}
				onChange={(kind) => set("kind", kind)}
			/>

			<Field id="addon-name" label="Add-on name" error={errors.name}>
				<input
					{...controlProps("addon-name", { error: errors.name })}
					type="text"
					autoComplete="off"
					placeholder="Like Parking pass or Welcome drink"
					value={form.name}
					onChange={(event) => set("name", event.target.value)}
					className={controlClass(Boolean(errors.name), "h-11")}
				/>
			</Field>

			{form.kind === "paid" && (
				<Field id="addon-price" label="Price" error={errors.price}>
					<NumberInput
						{...controlProps("addon-price", { error: errors.price })}
						prefix="₦"
						placeholder="0"
						value={form.price}
						onChange={(value) => set("price", value)}
					/>
				</Field>
			)}

			<Field
				id="addon-description"
				label="Description"
				optional
				aside={
					<span className="text-[12px] text-auth-muted">
						{form.description.length} / {DESCRIPTION_MAX}
					</span>
				}
			>
				<textarea
					{...controlProps("addon-description", {})}
					rows={2}
					maxLength={DESCRIPTION_MAX}
					placeholder="What guests get with it."
					value={form.description}
					onChange={(event) => set("description", event.target.value.slice(0, DESCRIPTION_MAX))}
					className={controlClass(false, "resize-y py-2.5 leading-normal")}
				/>
			</Field>

			<fieldset className="grid gap-2" aria-describedby={errors.who ? "addon-who-message" : undefined}>
				<legend className="mb-2 text-[13px] font-semibold text-auth-ink">Who can buy it</legend>
				{tickets.length > 0 &&
					whoCard(
						"tickets",
						"Guests buying these ticket types",
						"They add it to their order.",
						<div className="grid gap-2 pl-[26px]">
							{tickets.map((ticket) => (
								<CheckRow
									key={ticket.id}
									checked={form.ticketIds.includes(ticket.id)}
									onChange={() => toggleTicket(ticket.id)}
								>
									{ticket.name}
								</CheckRow>
							))}
						</div>
					)}
				{whoCard("anyone", "Anyone, without a ticket", "Sold on its own.")}
				{errors.who && (
					<p id="addon-who-message" className="text-[13px] leading-[1.45] text-auth-error">
						{errors.who}
					</p>
				)}
			</fieldset>

			<Field id="addon-qty" label="How many" error={errors.qty}>
				<NumberInput
					{...controlProps("addon-qty", { error: errors.qty })}
					placeholder="Number available"
					value={form.unlimited ? "" : form.qty}
					onChange={(value) => set("qty", value)}
					disabled={form.unlimited}
				/>
				<CheckRow checked={form.unlimited} onChange={() => set("unlimited", !form.unlimited)}>
					No limit
				</CheckRow>
			</Field>

			<Field id="addon-start" label="Sales start" error={errors.start}>
				<SelectField
					{...controlProps("addon-start", {})}
					value={form.window.startMode}
					options={startOptions(published)}
					onChange={(value) => setWindow({ startMode: value as Window["startMode"] })}
					placeholder="Pick when sales start"
				/>
				{form.window.startMode === "pick" && (
					<DateTimeField
						id="addon-start-at"
						aria-invalid={Boolean(errors.start) || undefined}
						aria-describedby={errors.start ? "addon-start-message" : undefined}
						aria-label="Add-on sales start date and time"
						kind="start"
						value={form.window.start}
						onChange={(start) => setWindow({ start })}
						placeholder="Pick a date and time"
					/>
				)}
			</Field>

			<Field id="addon-end" label="Sales end" error={errors.end}>
				<SelectField
					{...controlProps("addon-end", { error: form.window.endMode === "pick" ? undefined : errors.end })}
					value={form.window.endMode}
					options={endOptions(times)}
					onChange={(value) => setWindow({ endMode: value as Window["endMode"] })}
					placeholder="Pick when sales end"
				/>
				{form.window.endMode === "pick" && (
					<DateTimeField
						id="addon-end-at"
						aria-invalid={Boolean(errors.end) || undefined}
						aria-describedby={errors.end ? "addon-end-message" : undefined}
						aria-label="Add-on sales end date and time"
						kind="end"
						value={form.window.end}
						onChange={(end) => setWindow({ end })}
						placeholder="Pick a date and time"
					/>
				)}
			</Field>

			<SwitchRow
				id="addon-selling"
				title="Sell this add-on"
				detail={sellingDetail}
				on={form.selling}
				onChange={() => set("selling", !form.selling)}
			/>
		</Sheet>
	);
}
