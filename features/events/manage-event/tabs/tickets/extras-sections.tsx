"use client";
import * as React from "react";
import { EventTicket, EventTicketAddon, EventTicketPromo } from "@/types/event-ticket.types";
import { promoSummary } from "./discount-sheet";
import { dayMonth, instant, shortWhen } from "./format";
import { priceLabel } from "./ticket-status";
import {
	AddButton,
	EmptyBox,
	MenuItem,
	outlineButton,
	PillTone,
	RowMenu,
	SectionTitle,
	StatusPill,
	Toggle,
	sectionClass,
} from "./ui";

type Item = {
	id: string;
	name: string;
	sub: string;
	price?: string;
	status: { label: string; tone: PillTone; detail: string };
	on: boolean;
	onToggle: () => void;
	onEdit: () => void;
	menu: MenuItem[];
};

/** Discounts and add-ons share one list: name, what it is, status, an on/off switch and a menu. */
function ItemList({ items, busyId, switchLabel }: { items: Item[]; busyId: string | null; switchLabel: string }) {
	return (
		<ul className="overflow-hidden rounded-[14px] border border-auth-line">
			{items.map((item) => (
				<li
					key={item.id}
					className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-auth-info-soft px-[18px] py-4 first:border-t-0 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,1.5fr)_64px_40px] max-sm:px-4"
				>
					<div className="grid min-w-0 gap-0.5">
						<button
							type="button"
							onClick={item.onEdit}
							className="justify-self-start truncate text-left text-[15px] font-bold text-auth-ink hover:text-auth-link"
						>
							{item.name}
						</button>
						<span className="truncate text-[13px] text-auth-muted">{item.sub}</span>
					</div>
					<span className="text-[15px] font-semibold tabular-nums max-sm:justify-self-end">{item.price}</span>
					<div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 sm:grid sm:justify-items-start">
						<StatusPill tone={item.status.tone}>{item.status.label}</StatusPill>
						<span className="text-[13px] text-auth-muted">{item.status.detail}</span>
					</div>
					<div className="flex items-center justify-end gap-1 sm:contents">
						<Toggle
							on={item.on}
							onChange={item.onToggle}
							label={`${switchLabel} ${item.name}`}
							disabled={busyId === item.id}
						/>
						<RowMenu label={`More actions for ${item.name}`} items={item.menu} />
					</div>
				</li>
			))}
		</ul>
	);
}

function windowStatus(active: boolean, start: number | null, end: number | null, published: boolean, onLabel: string) {
	const now = Date.now();
	if (!active) return { label: "Off", tone: "off" as const, detail: "Turned off." };
	if (end !== null && end <= now) return { label: "Ended", tone: "off" as const, detail: `Ended ${dayMonth(end)}` };
	if (!published)
		return {
			label: "Ready",
			tone: "neutral" as const,
			detail: end !== null ? `Until ${shortWhen(end)}` : "Starts when you publish.",
		};
	if (start !== null && start > now)
		return { label: "Ready", tone: "neutral" as const, detail: `Starts ${shortWhen(start)}` };
	return { label: onLabel, tone: "success" as const, detail: end !== null ? `Until ${shortWhen(end)}` : "No end date" };
}

type DiscountsProps = {
	promos: EventTicketPromo[];
	tickets: EventTicket[];
	/** Paid ticket types that don't have a discount yet. */
	open: EventTicket[];
	published: boolean;
	busyId: string | null;
	onAdd: () => void;
	onEdit: (promo: EventTicketPromo) => void;
	onToggle: (promo: EventTicketPromo) => void;
	onRemove: (promo: EventTicketPromo) => void;
};

export function DiscountsSection({
	promos,
	tickets,
	open,
	published,
	busyId,
	onAdd,
	onEdit,
	onToggle,
	onRemove,
}: DiscountsProps) {
	const noTickets = tickets.length === 0;
	const addButton = (
		<button type="button" onClick={onAdd} disabled={!open.length} className={outlineButton}>
			Add a discount
		</button>
	);
	return (
		<section aria-labelledby="discounts-title" className={sectionClass}>
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
				<SectionTitle
					id="discounts-title"
					title="Discounts"
					optional
					text="Take money off a ticket type for a while, or give free tickets when guests buy a few."
				/>
				{promos.length > 0 && open.length > 0 && <AddButton onClick={onAdd}>Add a discount</AddButton>}
			</div>
			{promos.length ? (
				<ItemList
					busyId={busyId}
					switchLabel="Turn on"
					items={promos.map((promo) => {
						const ticket = tickets.find((item) => item.id === promo.ticket_id);
						return {
							id: promo.id,
							name: promo.name,
							sub: [ticket?.name, promoSummary(promo)].filter(Boolean).join(" · "),
							status: windowStatus(
								promo.is_active,
								instant(promo.sales_start_date),
								instant(promo.sales_end_date),
								published,
								"Running"
							),
							on: promo.is_active,
							onToggle: () => onToggle(promo),
							onEdit: () => onEdit(promo),
							menu: [
								{ label: "Edit", onSelect: () => onEdit(promo) },
								{ label: "Remove", onSelect: () => onRemove(promo), danger: true },
							],
						};
					})}
				/>
			) : (
				<EmptyBox
					phoneButton
					title="No discounts yet"
					text={
						noTickets
							? "Add a ticket type first. Each discount is for one ticket type."
							: open.length
								? "Each discount is for one ticket type, and you choose when it runs."
								: "Discounts are for paid ticket types. Add one first."
					}
					action={addButton}
				/>
			)}
		</section>
	);
}

type AddonsProps = {
	addons: EventTicketAddon[];
	tickets: EventTicket[];
	published: boolean;
	busyId: string | null;
	onAdd: () => void;
	onEdit: (addon: EventTicketAddon) => void;
	onToggle: (addon: EventTicketAddon) => void;
	onRemove: (addon: EventTicketAddon) => void;
};

export function AddonsSection({ addons, tickets, published, busyId, onAdd, onEdit, onToggle, onRemove }: AddonsProps) {
	return (
		<section aria-labelledby="addons-title" className={sectionClass}>
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
				<SectionTitle
					id="addons-title"
					title="Add-ons"
					optional
					text="Extras guests can buy, like parking, a drink or a table upgrade."
				/>
				{addons.length > 0 && <AddButton onClick={onAdd}>Add an add-on</AddButton>}
			</div>
			{addons.length ? (
				<ItemList
					busyId={busyId}
					switchLabel="Sell"
					items={addons.map((addon) => {
						const names = (addon.ticket_ids ?? [])
							.map((id) => tickets.find((ticket) => ticket.id === id)?.name)
							.filter(Boolean)
							.join(", ");
						return {
							id: addon.id,
							name: addon.name,
							sub: addon.ticket_ids?.length ? `With ${names || "chosen ticket types"}` : "On its own, to anyone",
							price: priceLabel(addon),
							status: windowStatus(
								addon.is_active,
								instant(addon.sales_start_date),
								instant(addon.sales_end_date),
								published,
								"On sale"
							),
							on: addon.is_active,
							onToggle: () => onToggle(addon),
							onEdit: () => onEdit(addon),
							menu: [
								{ label: "Edit", onSelect: () => onEdit(addon) },
								{ label: "Remove", onSelect: () => onRemove(addon), danger: true },
							],
						};
					})}
				/>
			) : (
				<EmptyBox
					phoneButton
					title="No add-ons yet"
					text="Sell them with a ticket, or on their own to people without one."
					action={
						<button type="button" onClick={onAdd} className={outlineButton}>
							Add an add-on
						</button>
					}
				/>
			)}
		</section>
	);
}
