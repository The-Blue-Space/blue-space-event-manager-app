"use client";
import * as React from "react";
import classNames from "classnames";
import { Search, X } from "lucide-react";
import { formatCount } from "@/features/home/dashboard/format";
import { Guest } from "@/types/guests.types";

const TIME_ZONE = "Africa/Lagos";
const shortDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE });
const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/** "Today, 9:12 AM", "Yesterday" or "Tue 10 Nov", on Lagos dates. */
export function when(iso: string) {
	const date = new Date(iso);
	const days = Math.round((Date.parse(dayKey.format(new Date())) - Date.parse(dayKey.format(date))) / 86_400_000);
	if (days === 0) return `Today, ${clock.format(date)}`;
	if (days === 1) return "Yesterday";
	return shortDay.format(date).replace(",", "");
}

export const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("") || "?";

export function Avatar({ name, dashed }: { name: string; dashed?: boolean }) {
	return (
		<span
			aria-hidden="true"
			className={classNames(
				"grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold",
				dashed ? "border border-dashed border-auth-field text-auth-muted" : "bg-auth-info-soft text-primary-500"
			)}
		>
			{initials(name)}
		</span>
	);
}

/** Name over @username (or email when they have no username). */
export function Person({ guest }: { guest: Pick<Guest, "name" | "username" | "email"> }) {
	return (
		<span className="grid min-w-0">
			<span className="truncate text-[14px] font-bold text-auth-ink">{guest.name}</span>
			<span className="truncate text-[13px] text-auth-muted">{guest.username ? `@${guest.username}` : guest.email}</span>
		</span>
	);
}

export function SearchBox({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
	const [draft, setDraft] = React.useState(value);
	React.useEffect(() => setDraft(value), [value]);
	React.useEffect(() => {
		if (draft.trim() === value.trim()) return;
		const timer = window.setTimeout(() => onChange(draft), 300);
		return () => window.clearTimeout(timer);
	}, [draft, value, onChange]);
	return (
		<div className="relative w-full sm:max-w-[320px]">
			<Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-auth-muted" />
			<input
				type="search"
				aria-label={label}
				placeholder="Search by name or username"
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				className="h-10 w-full rounded-lg border border-auth-field bg-white pl-10 pr-10 text-[14px] font-medium text-auth-ink placeholder:text-auth-placeholder hover:border-auth-field-hover focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15 [&::-webkit-search-cancel-button]:hidden"
			/>
			{draft && (
				<button
					type="button"
					aria-label="Clear search"
					onClick={() => {
						setDraft("");
						onChange("");
					}}
					className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-auth-muted hover:text-auth-ink"
				>
					<X aria-hidden="true" className="size-4" />
				</button>
			)}
		</div>
	);
}

export function Chips<T extends string>({ items, value, onChange }: { items: { id: T; label: string; count: number }[]; value: T; onChange: (id: T) => void }) {
	return (
		<div role="radiogroup" aria-label="Show" className="flex gap-2 overflow-x-auto pb-0.5">
			{items.map((item) => {
				const selected = item.id === value;
				return (
					<button
						key={item.id}
						type="button"
						role="radio"
						aria-checked={selected}
						onClick={() => onChange(item.id)}
						className={classNames(
							"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-bold transition-colors duration-150",
							selected ? "border-primary-500 bg-primary-500 text-white" : "border-auth-line bg-white text-auth-ink hover:border-auth-field"
						)}
					>
						{item.label}
						<span className={selected ? "font-semibold text-white/75" : "font-semibold text-auth-muted"}>{formatCount(item.count)}</span>
					</button>
				);
			})}
		</div>
	);
}

export function Pager({ page, limit, total, noun, onPage }: { page: number; limit: number; total: number; noun: string; onPage: (page: number) => void }) {
	if (total <= limit) return null;
	const first = (page - 1) * limit + 1;
	const last = Math.min(total, page * limit);
	const button =
		"h-10 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover disabled:cursor-not-allowed disabled:border-auth-line disabled:text-[#8E8DB0]";
	return (
		<nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3">
			<p className="text-[13px] text-auth-muted">
				Showing {formatCount(first)} to {formatCount(last)} of {formatCount(total)} {noun}
			</p>
			<div className="flex gap-2">
				<button type="button" className={button} disabled={page <= 1} onClick={() => onPage(page - 1)}>
					Previous
				</button>
				<button type="button" className={button} disabled={last >= total} onClick={() => onPage(page + 1)}>
					Next
				</button>
			</div>
		</nav>
	);
}

export const outlineButton =
	"inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover disabled:cursor-not-allowed disabled:opacity-60";
export const primaryButton =
	"inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60";
