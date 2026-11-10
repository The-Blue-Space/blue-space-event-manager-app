"use client";
import Image from "next/image";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { variables } from "@/constants";
import { HomeSpotlight } from "@/types/home.types";
import { describeDaysUntil, formatCount, formatNaira, formatShortDate, formatTime, plural } from "./format";
import { Pill, Progress } from "./ui";

const secondaryAction =
	"inline-flex h-10 items-center rounded-lg border border-auth-field px-4 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover hover:bg-auth-page";

function Cover({ url }: { url: string | null }) {
	if (!url) {
		return <div aria-hidden="true" className="aspect-[3/1] bg-primary-500" />;
	}
	return (
		<div className="relative aspect-[2/1] sm:aspect-[3/1]">
			<Image src={url} alt="" fill priority sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
		</div>
	);
}

export function Tiers({ tiers }: { tiers: HomeSpotlight["tiers"] }) {
	if (!tiers.length) return null;
	return (
		<ul className="border-t border-auth-line">
			{tiers.map((tier) => {
				const soldOut = tier.total !== null && tier.sold >= tier.total;
				return (
					<li key={tier.id} className="flex items-center gap-4 border-b border-auth-info-soft py-3">
						<div className="min-w-0 flex-1">
							<p className="text-[14px] font-semibold text-auth-ink">{tier.name}</p>
							<p className="mt-0.5 text-[13px] text-auth-muted">{tier.price_kobo ? formatNaira(tier.price_kobo) : "Free"}</p>
						</div>
						<div className="grid w-40 gap-1.5 text-right text-[13px] tabular-nums text-auth-muted">
							{tier.total === null ? (
								<p>
									<strong className="text-auth-ink">{formatCount(tier.sold)}</strong> sold
								</p>
							) : (
								<>
									<p>
										<strong className="text-auth-ink">{formatCount(tier.sold)}</strong> of {formatCount(tier.total)}
										{soldOut && " · Sold out"}
									</p>
									<Progress value={tier.sold} max={tier.total} className="h-1" barClassName="bg-auth-link" />
								</>
							)}
						</div>
					</li>
				);
			})}
		</ul>
	);
}

export function Sales({ sold, capacity, revenueKobo }: { sold: number; capacity: number | null; revenueKobo: number }) {
	return (
		<div className="grid gap-2.5">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[15px] text-auth-muted">
				<p>
					<strong className="text-[20px] tabular-nums text-auth-ink">{formatCount(sold)}</strong>
					{capacity ? ` of ${formatCount(capacity)} tickets sold` : sold === 1 ? " ticket sold" : " tickets sold"}
				</p>
				<p>
					<strong className="text-[20px] tabular-nums text-auth-ink">{formatNaira(revenueKobo)}</strong> in ticket sales
				</p>
			</div>
			{capacity ? <Progress value={sold} max={capacity} label="Tickets sold" /> : null}
		</div>
	);
}

function CheckIn({ spotlight }: { spotlight: HomeSpotlight }) {
	const { checked_in: checkedIn, tickets_sold: sold } = spotlight;
	return (
		<div className="grid gap-2.5">
			<h3 className="text-[13px] font-semibold text-auth-muted">Check-in</h3>
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[15px] text-auth-muted">
				<p>
					<strong className="text-[20px] tabular-nums text-auth-ink">{formatCount(checkedIn)}</strong> of {plural(sold, "guest")} checked in
				</p>
				<p className="text-[14px]">{formatCount(Math.max(sold - checkedIn, 0))} still to arrive</p>
			</div>
			<Progress value={checkedIn} max={sold} label="Guests checked in" />
		</div>
	);
}

function Photos({ spotlight }: { spotlight: HomeSpotlight }) {
	const { count, recent } = spotlight.photos;
	return (
		<div className="grid gap-2.5">
			<div className="flex items-baseline justify-between gap-4">
				<h3 className="text-[13px] font-semibold text-auth-muted">
					Photos from tonight · {plural(count, "photo")} in the shared album
				</h3>
			</div>
			{recent.length ? (
				<ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
					{recent.map((photo) => (
						<li key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-auth-info-soft">
							<Image src={photo.url} alt="Photo a guest added to the album" fill sizes="120px" className="object-cover" />
						</li>
					))}
				</ul>
			) : (
				<p className="text-[14px] text-auth-muted">Photos show up here as guests add them to the album.</p>
			)}
		</div>
	);
}

export default function Spotlight({ spotlight }: { spotlight: HomeSpotlight }) {
	const { event, status } = spotlight;
	const live = status === "live";
	const place = [event.venue_name, event.address, event.city].filter(Boolean).join(", ");
	const eventLink = variables.EXTERNAL_LINKS.website ? `${variables.EXTERNAL_LINKS.website}/events/${event.id}` : "";

	let when = "";
	if (live) {
		when = [event.doors_open_at && `Doors opened ${formatTime(event.doors_open_at)}`, event.ends_at && `ends ${formatTime(event.ends_at)}`]
			.filter(Boolean)
			.join(" · ");
	} else if (event.starts_at) {
		when = `${formatShortDate(event.starts_at)} · ${event.doors_open_at ? "Doors" : "Starts"} ${formatTime(event.doors_open_at ?? event.starts_at)}`;
	}

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(eventLink);
			toast.success("Event link copied");
		} catch {
			toast.error("We couldn't copy the link. Copy it from the event page instead.");
		}
	};

	return (
		<section aria-labelledby="spotlight-title" className="overflow-hidden rounded-[14px] border border-auth-line">
			<Cover url={event.cover_url} />
			<div className="grid gap-5 p-[18px] sm:px-6 sm:pb-6 sm:pt-[22px]">
				<header className="grid gap-1.5">
					<div className="flex flex-wrap items-center gap-2.5">
						{live ? (
							<Pill tone="warning">Live now</Pill>
						) : (
							<>
								<span className="text-[13px] font-semibold text-auth-muted">
									Next event{event.starts_at && ` · ${describeDaysUntil(event.starts_at)}`}
								</span>
								<Pill tone="success">On sale</Pill>
							</>
						)}
						{live && when && <span className="text-[13px] font-semibold text-auth-muted">{when}</span>}
					</div>
					<h2 id="spotlight-title" className="text-[20px] font-bold leading-[1.3] text-auth-ink sm:text-[22px]">
						{event.title}
					</h2>
					<p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-auth-muted">
						{!live && when && <span>{when}</span>}
						{place && <span>{place}</span>}
					</p>
				</header>

				{live ? (
					<>
						<CheckIn spotlight={spotlight} />
						<Photos spotlight={spotlight} />
					</>
				) : (
					<>
						<Sales sold={spotlight.tickets_sold} capacity={event.capacity} revenueKobo={spotlight.revenue_kobo} />
						<Tiers tiers={spotlight.tiers} />
					</>
				)}

				<div className="flex flex-wrap gap-2.5">
					<Link href={`/events/${event.id}`} className={secondaryAction}>
						Manage event
					</Link>
					{eventLink && (
						<button
							type="button"
							onClick={copyLink}
							className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold text-auth-link transition-colors duration-150 hover:bg-auth-info-soft"
						>
							<Link2 aria-hidden="true" className="size-4" />
							Copy event link
						</button>
					)}
				</div>
			</div>
		</section>
	);
}
