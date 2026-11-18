"use client";
import * as React from "react";
import { Plus, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EventTicket } from "@/types/event-ticket.types";
import { commas, nairaFromKobo } from "./format";
import { priceLabel, ticketStatus, ticketSub, totalOf } from "./ticket-status";
import { AddButton, Bar, RowMenu, SectionTitle, StatusPill, Toggle } from "./ui";
import { TicketsData } from "./use-tickets";

const STARTERS = ["Regular", "Early bird", "VIP", "Table for four"];
const GRID =
	"grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_64px_40px] items-center gap-4 px-[18px]";

type TypesSectionProps = {
	data: TicketsData;
	busyId: string | null;
	onAdd: (name?: string) => void;
	onEdit: (ticket: EventTicket) => void;
	onToggle: (ticket: EventTicket) => void;
	onRemove: (ticket: EventTicket) => void;
};

function SoldText({ sold, total }: { sold: number; total: number | null }) {
	return (
		<span className="text-[13px] tabular-nums text-auth-muted">
			<strong className="font-bold text-auth-ink">{commas(sold)}</strong>
			{total === null ? " sold · no limit" : ` of ${commas(total)} sold`}
		</span>
	);
}

export default function TypesSection({ data, busyId, onAdd, onEdit, onToggle, onRemove }: TypesSectionProps) {
	const { tickets, ticketsQuery, sold, times, revenueKobo } = data;
	const published = times.published;

	const rows = tickets.map((ticket) => {
		const count = sold.get(ticket.id) ?? 0;
		return { ticket, count, total: totalOf(ticket), status: ticketStatus(ticket, count, times) };
	});
	const soldAll = rows.reduce((sum, row) => sum + row.count, 0);
	const capacity = rows.every((row) => row.total !== null)
		? rows.reduce((sum, row) => sum + (row.total ?? 0), 0)
		: null;
	const anySelling = tickets.some((ticket) => ticket.is_active);

	const menu = (ticket: EventTicket, count: number) => [
		{ label: "Edit", onSelect: () => onEdit(ticket) },
		...(count === 0 ? [{ label: "Remove", onSelect: () => onRemove(ticket), danger: true }] : []),
	];

	let body: React.ReactNode;
	if (ticketsQuery.isLoading) {
		body = <Skeleton className="h-40 w-full rounded-[14px]" />;
	} else if (!tickets.length) {
		body = (
			<div className="grid justify-items-start gap-3.5 rounded-[14px] border border-dashed border-auth-field bg-auth-page p-7">
				<span
					aria-hidden="true"
					className="grid size-11 place-items-center rounded-xl bg-auth-info-soft text-primary-500"
				>
					<Ticket className="size-[22px]" />
				</span>
				<div>
					<p className="text-[16px] font-bold text-auth-ink">Add your first ticket type</p>
					<p className="mt-1 max-w-[62ch] text-[14px] leading-normal text-auth-muted">
						Most events start with one, like Regular. You can add early bird, VIP or group tickets any time. You need
						one turned on to publish.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => onAdd()}
						className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-primary-600"
					>
						<Plus aria-hidden="true" className="size-4" />
						Add ticket type
					</button>
					<span className="px-1 text-[13px] text-auth-muted">or start from</span>
					{STARTERS.map((name) => (
						<button
							key={name}
							type="button"
							onClick={() => onAdd(name)}
							className="h-[34px] rounded-full border border-auth-line bg-white px-3 text-[13px] font-semibold text-auth-ink transition-colors hover:border-auth-field"
						>
							{name}
						</button>
					))}
				</div>
			</div>
		);
	} else {
		body = (
			<>
				<div className="overflow-hidden rounded-[14px] border border-auth-line">
					<div
						aria-hidden="true"
						className={`${GRID} border-b border-auth-line bg-auth-page py-2.5 text-[12px] font-semibold text-auth-muted max-sm:hidden`}
					>
						<span>Ticket type</span>
						<span>Price</span>
						<span>Sold</span>
						<span>Status</span>
						<span>Selling</span>
						<span />
					</div>
					<ul>
						{rows.map(({ ticket, count, total, status }) => (
							<li key={ticket.id} className="border-t border-auth-info-soft first:border-t-0">
								{/* Wide screens: one row per ticket type */}
								<div className={`${GRID} py-4 max-sm:hidden`}>
									<div className="grid min-w-0 gap-0.5">
										<button
											type="button"
											onClick={() => onEdit(ticket)}
											className="justify-self-start truncate text-left text-[15px] font-bold text-auth-ink hover:text-auth-link"
										>
											{ticket.name}
										</button>
										<span className="text-[13px] leading-[1.4] text-auth-muted">{ticketSub(ticket)}</span>
									</div>
									<span className="text-[15px] font-semibold tabular-nums">{priceLabel(ticket)}</span>
									<div className="grid gap-1.5">
										<SoldText sold={count} total={total} />
										<Bar value={count} max={total} />
									</div>
									<div className="grid min-w-0 justify-items-start gap-1">
										<StatusPill tone={status.tone}>{status.label}</StatusPill>
										<span className="text-[13px] text-auth-muted">{status.detail}</span>
									</div>
									<Toggle
										on={ticket.is_active}
										onChange={() => onToggle(ticket)}
										label={`Sell ${ticket.name}`}
										disabled={busyId === ticket.id}
									/>
									<RowMenu label={`More actions for ${ticket.name}`} items={menu(ticket, count)} />
								</div>

								{/* Phones: a card per ticket type */}
								<div className="grid gap-2.5 p-4 sm:hidden">
									<div className="flex items-baseline justify-between gap-3">
										<button
											type="button"
											onClick={() => onEdit(ticket)}
											className="min-w-0 truncate text-left text-[15px] font-bold"
										>
											{ticket.name}
										</button>
										<span className="shrink-0 text-[15px] font-semibold tabular-nums">{priceLabel(ticket)}</span>
									</div>
									<div className="grid gap-1.5">
										<SoldText sold={count} total={total} />
										<Bar value={count} max={total} />
									</div>
									<div className="flex items-center gap-2.5">
										<StatusPill tone={status.tone}>{status.label}</StatusPill>
										<span className="min-w-0 flex-1 text-[13px] text-auth-muted">{status.detail}</span>
										<Toggle
											on={ticket.is_active}
											onChange={() => onToggle(ticket)}
											label={`Sell ${ticket.name}`}
											disabled={busyId === ticket.id}
										/>
									</div>
								</div>
							</li>
						))}
					</ul>
					{published && (
						<div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-auth-line bg-auth-page px-[18px] py-3.5 text-[14px] text-auth-muted max-sm:px-4 max-sm:py-3 max-sm:text-[13px]">
							<span>
								<strong className="text-auth-ink">{commas(soldAll)}</strong>
								{capacity === null ? " sold" : ` of ${commas(capacity)} sold`}
							</span>
							<span>
								<strong className="tabular-nums text-auth-ink">{nairaFromKobo(revenueKobo)}</strong> in ticket sales
							</span>
						</div>
					)}
				</div>
				{!published && (
					<p className="text-[13px] leading-normal text-auth-muted">
						{anySelling
							? "Guests can buy ticket types that are on, once you publish. Click a name to change it."
							: "Turn on at least one ticket type to publish. Click a name to change it."}
					</p>
				)}
				<button
					type="button"
					onClick={() => onAdd()}
					className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-auth-field bg-white text-[15px] font-semibold text-auth-ink sm:hidden"
				>
					<Plus aria-hidden="true" className="size-4" />
					Add ticket type
				</button>
			</>
		);
	}

	return (
		<section aria-labelledby="types-title" className="grid gap-4">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
				<SectionTitle
					id="types-title"
					title="Ticket types"
					text="What guests can buy. Only ticket types you turn on are sold."
				/>
				{tickets.length > 0 && (
					<div className="max-sm:hidden">
						<AddButton onClick={() => onAdd()}>Add ticket type</AddButton>
					</div>
				)}
			</div>
			{body}
		</section>
	);
}
