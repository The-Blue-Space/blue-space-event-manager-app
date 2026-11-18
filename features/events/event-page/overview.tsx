"use client";
import Link from "next/link";
import classNames from "classnames";
import { Check } from "lucide-react";
import { formatNaira, formatShortDate, formatWhen, plural } from "@/features/home/dashboard/format";
import { Sales, Tiers } from "@/features/home/dashboard/spotlight";
import { EventSummary } from "@/types/event-summary.types";
import { ACCESS_LABEL, EventTab, setupSteps } from "./steps";

type OverviewProps = { summary: EventSummary; onNavigate: (tab: EventTab) => void };

const linkButton = "text-[14px] font-semibold text-auth-link hover:text-primary-500";

function refundText({ type, days }: EventSummary["refund_policy"]) {
	if (!type || type === "no-refund") return "No refunds";
	const window = days ? ` up to ${plural(days, "day")} before` : "";
	return `${type === "full-refund" ? "Full" : "Partial"} refund${window}`;
}

function Checklist({ summary, onNavigate }: OverviewProps) {
	const steps = setupSteps(summary);
	const done = steps.filter((step) => step.done).length;
	const current = steps.findIndex((step) => !step.done);

	return (
		<section aria-labelledby="get-ready" className="grid gap-4 rounded-[14px] border border-auth-line p-5 sm:p-6">
			<div className="grid gap-2.5">
				<div className="flex items-baseline justify-between gap-4">
					<h2 id="get-ready" className="text-[18px] font-bold text-auth-ink">
						Get ready to publish
					</h2>
					<span className="shrink-0 text-[13px] text-auth-muted">
						{done} of {steps.length} done
					</span>
				</div>
				<div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-auth-info-soft">
					<div className="h-full rounded-full bg-auth-success" style={{ width: `${(done / steps.length) * 100}%` }} />
				</div>
			</div>
			<ol>
				{steps.map((step, index) => {
					const isCurrent = index === current;
					return (
						<li
							key={step.key}
							aria-current={isCurrent ? "step" : undefined}
							className={classNames(
								"flex flex-wrap items-center gap-x-3.5 gap-y-3",
								isCurrent ? "-mx-3 rounded-xl bg-auth-page p-3 sm:-mx-4 sm:p-4" : "border-t border-auth-info-soft py-3.5 first:border-0"
							)}
						>
							<span
								aria-hidden="true"
								className={classNames(
									"grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold",
									step.done && "bg-auth-success text-white",
									isCurrent && "bg-primary-500 text-white",
									!step.done && !isCurrent && "border border-auth-field text-auth-muted"
								)}
							>
								{step.done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
							</span>
							<div className="min-w-0 flex-1 basis-56">
								<p className={classNames("text-[15px]", isCurrent ? "font-bold" : "font-semibold", step.done ? "text-auth-muted" : "text-auth-ink")}>
									{step.title}
									{step.done && <span className="sr-only"> (done)</span>}
								</p>
								<p className="mt-0.5 text-[13px] leading-[1.45] text-auth-muted">{step.detail}</p>
							</div>
							{step.tab && step.action && (
								<button
									type="button"
									onClick={() => onNavigate(step.tab!)}
									className={
										isCurrent
											? "inline-flex h-10 items-center rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600"
											: linkButton
									}
								>
									{step.done ? "Edit" : step.action}
								</button>
							)}
						</li>
					);
				})}
			</ol>
		</section>
	);
}

const EXTRAS: { title: string; detail: string; tab: EventTab }[] = [
	{ title: "Overview and good to know", detail: "Age limit, parking, FAQs.", tab: "details" },
	{ title: "Agenda and lineup", detail: "What happens when, and who’s on.", tab: "agenda" },
	{ title: "Photos and a video", detail: "Show what the night is like.", tab: "media" },
];

function GoodToAdd({ onNavigate }: Pick<OverviewProps, "onNavigate">) {
	return (
		<section aria-labelledby="good-to-add" className="grid gap-2">
			<h2 id="good-to-add" className="text-[15px] font-bold text-auth-ink">
				Good to add
			</h2>
			<div className="grid gap-2.5 sm:grid-cols-3">
				{EXTRAS.map((extra) => (
					<button
						key={extra.title}
						type="button"
						onClick={() => onNavigate(extra.tab)}
						className="grid gap-0.5 rounded-xl border border-auth-line px-4 py-3.5 text-left transition-colors duration-150 hover:border-auth-field"
					>
						<span className="text-[14px] font-bold text-auth-ink">{extra.title}</span>
						<span className="text-[13px] text-auth-muted">{extra.detail}</span>
					</button>
				))}
			</div>
		</section>
	);
}

function LatestOrders({ summary }: { summary: EventSummary }) {
	const orders = summary.recent_orders;
	return (
		<section aria-labelledby="latest-orders" className="grid gap-1">
			<div className="mb-1.5 flex items-baseline justify-between gap-4">
				<h2 id="latest-orders" className="text-[15px] font-bold text-auth-ink">
					Latest orders
				</h2>
				<Link href="/orders" className={linkButton}>
					All orders
				</Link>
			</div>
			{orders.length ? (
				<ul className="divide-y divide-auth-line border-y border-auth-line">
					{orders.map((order) => {
						const at = order.status === "refunded" ? order.refunded_at : order.paid_at;
						const detail = [plural(order.quantity, "ticket"), at && formatWhen(at), order.status !== "paid" && order.status].filter(Boolean);
						return (
							<li key={order.id} className="flex items-center gap-3 py-3">
								<span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-auth-ink">
									{order.buyer_name || order.buyer_username || "Guest"}
									<span className="font-medium text-auth-muted"> · {detail.join(" · ")}</span>
								</span>
								<span className="text-[14px] font-bold tabular-nums text-auth-ink">{formatNaira(order.amount_kobo)}</span>
							</li>
						);
					})}
				</ul>
			) : (
				<p className="rounded-xl border border-auth-line px-4 py-5 text-center text-[14px] text-auth-muted">
					No orders yet. They show up here as soon as guests buy tickets.
				</p>
			)}
		</section>
	);
}

function AtAGlance({ summary }: { summary: EventSummary }) {
	const { event, refund_policy: refunds } = summary;
	const rows = [
		{
			label: "How guests get in",
			value: ACCESS_LABEL[event.access_type],
			note: event.published ? "Can’t be changed after publishing." : "You can change this until you publish.",
		},
		{ label: "Who can find it", value: event.is_private ? "Private" : "Public" },
		{ label: "Refunds", value: refundText(refunds), note: refunds.inherited ? "From your event defaults." : undefined },
		...(event.published_at ? [{ label: "Published", value: formatShortDate(event.published_at) }] : []),
	];
	return (
		<aside aria-labelledby="at-a-glance" className="grid min-w-0 max-w-[360px] flex-[1_1_300px] content-start">
			<h2 id="at-a-glance" className="mb-1.5 text-[15px] font-bold text-auth-ink">
				At a glance
			</h2>
			<dl className="border-b border-auth-line">
				{rows.map((row) => (
					<div key={row.label} className="grid gap-0.5 border-t border-auth-line py-3.5">
						<dt className="text-[13px] text-auth-muted">{row.label}</dt>
						<dd className="text-[15px] font-semibold text-auth-ink">{row.value}</dd>
						{row.note && <dd className="text-[12.5px] text-auth-muted">{row.note}</dd>}
					</div>
				))}
			</dl>
			{refunds.inherited && (
				<Link href="/settings?tab=events" className={classNames(linkButton, "mt-3")}>
					Event defaults
				</Link>
			)}
		</aside>
	);
}

export default function Overview({ summary, onNavigate }: OverviewProps) {
	const isDraft = summary.event.status === "draft" || summary.event.status === "scheduled";
	const { sales, event } = summary;

	return (
		<div className="flex flex-wrap items-start gap-8 pt-2">
			<div className="grid min-w-0 flex-[999_1_560px] gap-7">
				{isDraft ? (
					<>
						<Checklist summary={summary} onNavigate={onNavigate} />
						<GoodToAdd onNavigate={onNavigate} />
					</>
				) : event.access_type !== "ticket-based" ? (
					<section aria-labelledby="guests-panel" className="grid justify-items-start gap-2 rounded-[14px] border border-auth-line p-5 sm:p-6">
						<h2 id="guests-panel" className="text-[15px] font-bold text-auth-ink">
							Guests
						</h2>
						<p className="text-[14px] leading-[1.5] text-auth-muted">
							It’s published, and guests get in with: {ACCESS_LABEL[event.access_type].toLowerCase()}. See who’s joining and
							invite more people on the Guests tab.
						</p>
						<button type="button" onClick={() => onNavigate("guests")} className={linkButton}>
							Go to Guests
						</button>
					</section>
				) : (
					<>
						<section aria-labelledby="ticket-sales" className="grid gap-4 rounded-[14px] border border-auth-line p-5 sm:p-6">
							<h2 id="ticket-sales" className="text-[15px] font-bold text-auth-ink">
								Ticket sales
							</h2>
							<Sales sold={sales.tickets_sold} capacity={event.capacity} revenueKobo={sales.revenue_kobo} />
							<Tiers tiers={sales.tiers} />
						</section>
						<LatestOrders summary={summary} />
					</>
				)}
			</div>
			<AtAGlance summary={summary} />
		</div>
	);
}
