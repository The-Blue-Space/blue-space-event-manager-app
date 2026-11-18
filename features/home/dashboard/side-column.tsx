import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { HomeChange, HomeDashboard, HomeEventSummary } from "@/types/home.types";
import { describeChange, formatCount, formatNaira, formatShortDate, formatTime } from "./format";
import { Pill, Progress, SectionHeader } from "./ui";

function ChangeIcon({ change }: { change: number | null }) {
	const Icon = change === null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
	return <Icon aria-hidden="true" className="size-3.5 shrink-0 text-auth-ink" />;
}

export function LastThirtyDays({ stats }: { stats: HomeDashboard["last_30_days"] }) {
	const rows: { label: string; value: string; change: HomeChange }[] = [
		{ label: "Tickets sold", value: formatCount(stats.tickets_sold.current), change: stats.tickets_sold },
		{ label: "Revenue", value: formatNaira(stats.revenue_kobo.current), change: stats.revenue_kobo },
		{ label: "Attendees", value: formatCount(stats.attendees.current), change: stats.attendees },
	];
	return (
		<section aria-labelledby="last-30-days">
			<h2 id="last-30-days" className="mb-1.5 text-[15px] font-bold text-auth-ink">
				Last 30 days
			</h2>
			<dl>
				{rows.map(({ label, value, change }) => (
					<div key={label} className="grid gap-0.5 border-t border-auth-line py-3.5">
						<dt className="text-[13px] text-auth-muted">{label}</dt>
						<dd className="text-[24px] font-bold leading-tight tabular-nums text-auth-ink">{value}</dd>
						<dd className="flex items-center gap-1 text-[13px] text-auth-muted">
							<ChangeIcon change={change.change_pct} />
							{describeChange(change.change_pct)}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}

export function TonightSoFar({ ticketsSold, capacity, photos, refundsWaiting }: { ticketsSold: number; capacity: number | null; photos: number; refundsWaiting: number }) {
	return (
		<section aria-labelledby="tonight">
			<h2 id="tonight" className="mb-1.5 text-[15px] font-bold text-auth-ink">
				Tonight so far
			</h2>
			<dl className="border-b border-auth-line">
				<div className="grid gap-0.5 border-t border-auth-line py-3.5">
					<dt className="text-[13px] text-auth-muted">Tickets sold</dt>
					<dd className="text-[24px] font-bold leading-tight tabular-nums text-auth-ink">
						{formatCount(ticketsSold)}
						{capacity ? <span className="text-[14px] font-medium text-auth-muted"> of {formatCount(capacity)}</span> : null}
					</dd>
				</div>
				<div className="grid gap-0.5 border-t border-auth-line py-3.5">
					<dt className="text-[13px] text-auth-muted">Photos in the album</dt>
					<dd className="text-[24px] font-bold leading-tight tabular-nums text-auth-ink">{formatCount(photos)}</dd>
				</div>
				<div className="grid gap-0.5 border-t border-auth-line py-3.5">
					<dt className="text-[13px] text-auth-muted">Refund requests waiting</dt>
					<dd className="flex items-baseline gap-2 text-[24px] font-bold leading-tight tabular-nums text-auth-ink">
						{formatCount(refundsWaiting)}
						{refundsWaiting > 0 && (
							<Link href="/refunds" className="text-[14px] font-semibold text-auth-link hover:text-primary-500">
								Review
							</Link>
						)}
					</dd>
				</div>
			</dl>
		</section>
	);
}

export function Withdrawable({ kobo }: { kobo: number }) {
	return (
		<section aria-labelledby="withdrawable" className="grid gap-2.5 rounded-xl border border-auth-line bg-auth-page p-[18px]">
			<h2 id="withdrawable" className="text-[13px] font-semibold text-auth-muted">
				Available to withdraw
			</h2>
			<p className="text-[24px] font-bold leading-tight tabular-nums text-auth-ink">{formatNaira(kobo)}</p>
			<p className="text-[13px] leading-[1.45] text-auth-muted">
				{kobo > 0 ? "You request payouts one event at a time." : "Nothing to withdraw right now."}
			</p>
			<Link
				href="/finance"
				className="inline-flex h-[38px] items-center justify-self-start rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
			>
				{kobo > 0 ? "Request payout" : "Go to Finance"}
			</Link>
		</section>
	);
}

function EventRow({ event }: { event: HomeEventSummary }) {
	return (
		<li className="border-t border-auth-line">
			<Link href={`/events/${event.id}`} className="flex gap-3 py-3 text-auth-ink">
				<span className="relative size-14 shrink-0 overflow-hidden rounded-[10px] bg-primary-500">
					{event.cover_url && <Image src={event.cover_url} alt="" fill sizes="56px" className="object-cover" />}
				</span>
				<span className="grid min-w-0 flex-1 content-start gap-1">
					<span className="text-[14px] font-bold">{event.title}</span>
					{event.starts_at && (
						<span className="text-[13px] text-auth-muted">
							{formatShortDate(event.starts_at)} · {formatTime(event.starts_at)}
						</span>
					)}
					{!event.published ? (
						<span>
							<Pill tone="neutral">Draft</Pill>
						</span>
					) : event.capacity ? (
						<span className="flex items-center gap-2 text-[12px] tabular-nums text-auth-muted">
							<Progress value={event.tickets_sold} max={event.capacity} className="h-1 flex-1" barClassName="bg-auth-link" />
							{formatCount(event.tickets_sold)} of {formatCount(event.capacity)} sold
						</span>
					) : (
						<span className="text-[12px] text-auth-muted">{formatCount(event.tickets_sold)} sold</span>
					)}
				</span>
			</Link>
		</li>
	);
}

export function ComingUp({ events, title }: { events: HomeEventSummary[]; title: string }) {
	if (!events.length) return null;
	return (
		<section aria-labelledby="coming-up" className="grid gap-1.5">
			<SectionHeader id="coming-up" title={title} href="/events" linkLabel="All events" />
			<ul>
				{events.map((event) => (
					<EventRow key={event.id} event={event} />
				))}
			</ul>
		</section>
	);
}
