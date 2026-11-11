"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { ChevronRight, Plus, Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardError } from "@/features/home/dashboard/states";
import { formatCount } from "@/features/home/dashboard/format";
import getManagerEvents from "@/services/events/get-manager-events";
import useActions from "@/store/actions";
import { EventsView, ManagerEvent, ManagerEventsPage } from "@/types/manager-events.types";
import EventRow from "./event-row";

const VIEWS: { id: EventsView; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "upcoming", label: "Upcoming" },
	{ id: "drafts", label: "Drafts" },
	{ id: "past", label: "Past" },
];

const PAGE_SIZE: Record<EventsView, number> = { all: 10, upcoming: 20, drafts: 20, past: 10 };

const TIME_ZONE = "Africa/Lagos";
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: TIME_ZONE });
const monthKey = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: TIME_ZONE });
const yearName = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: TIME_ZONE });
const thisYear = yearName.format(new Date());

const asView = (value: string | null): EventsView => VIEWS.find((view) => view.id === value)?.id ?? "all";

/** The view, search and page live in the address, so Back and shared links keep them. */
function useListState() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const view = asView(params.get("view"));
	const search = params.get("search") ?? "";
	const page = Math.max(1, Number(params.get("page")) || 1);

	const update = React.useCallback(
		(next: { view?: EventsView; search?: string; page?: number }) => {
			const query = new URLSearchParams(params.toString());
			const set = (key: string, value: string | undefined) => (value ? query.set(key, value) : query.delete(key));
			if (next.view !== undefined) set("view", next.view === "all" ? undefined : next.view);
			if (next.search !== undefined) set("search", next.search.trim() || undefined);
			set("page", next.page && next.page > 1 ? String(next.page) : undefined);
			const queryString = query.toString();
			router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
		},
		[params, pathname, router]
	);
	return { view, search, page, update };
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
	const [draft, setDraft] = React.useState(value);
	React.useEffect(() => setDraft(value), [value]);
	React.useEffect(() => {
		if (draft.trim() === value.trim()) return;
		const timer = window.setTimeout(() => onChange(draft), 300);
		return () => window.clearTimeout(timer);
	}, [draft, value, onChange]);

	return (
		<div className="relative w-full sm:max-w-[340px]">
			<Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-auth-muted" />
			<input
				type="search"
				aria-label="Search events"
				placeholder="Search by name or venue"
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				className="h-11 w-full rounded-lg border border-auth-field bg-white pl-10 pr-10 text-[15px] font-medium text-auth-ink placeholder:text-auth-placeholder hover:border-auth-field-hover focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15 [&::-webkit-search-cancel-button]:hidden"
			/>
			{draft && (
				<button
					type="button"
					aria-label="Clear search"
					onClick={() => {
						setDraft("");
						onChange("");
					}}
					className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-auth-muted hover:text-auth-ink"
				>
					<X aria-hidden="true" className="size-4" />
				</button>
			)}
		</div>
	);
}

function ViewChips({ view, counts, onChange }: { view: EventsView; counts?: ManagerEventsPage["counts"]; onChange: (view: EventsView) => void }) {
	return (
		<div role="radiogroup" aria-label="Show" className="flex gap-2 overflow-x-auto pb-0.5">
			{VIEWS.map((item) => {
				const selected = item.id === view;
				return (
					<button
						key={item.id}
						type="button"
						role="radio"
						aria-checked={selected}
						onClick={() => onChange(item.id)}
						className={classNames(
							"inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-bold transition-colors duration-150",
							selected
								? "border-primary-500 bg-primary-500 text-white"
								: "border-auth-line bg-white text-auth-ink hover:border-auth-field"
						)}
					>
						{item.label}
						{counts && <span className={selected ? "font-semibold text-white/75" : "font-semibold text-auth-muted"}>{formatCount(counts[item.id])}</span>}
					</button>
				);
			})}
		</div>
	);
}

function Group({ id, title, count, events, footer }: { id: string; title: string; count?: number; events: ManagerEvent[]; footer?: React.ReactNode }) {
	if (!events.length) return null;
	return (
		<section aria-labelledby={id} className="grid gap-2.5">
			<h2 id={id} className="text-[16px] font-bold text-auth-ink">
				{title}
				{count !== undefined && <span className="ml-1.5 font-medium text-auth-muted">{formatCount(count)}</span>}
			</h2>
			<div className="overflow-hidden rounded-[14px] border border-auth-line bg-white">
				<ul className="divide-y divide-auth-line">
					{events.map((event) => (
						<EventRow key={event.id} event={event} />
					))}
				</ul>
				{footer}
			</div>
		</section>
	);
}

function SeeAll({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center justify-between border-t border-auth-line px-4 py-3.5 text-left text-[14px] font-semibold text-auth-link transition-colors duration-150 hover:bg-auth-page hover:text-primary-500"
		>
			{label}
			<ChevronRight aria-hidden="true" className="size-4" />
		</button>
	);
}

/** Splits events into consecutive runs that share a label, keeping their order. */
function groupBy(events: ManagerEvent[], label: (event: ManagerEvent) => string) {
	const groups: { label: string; events: ManagerEvent[] }[] = [];
	for (const event of events) {
		const key = label(event);
		const last = groups.at(-1);
		if (last && last.label === key) last.events.push(event);
		else groups.push({ label: key, events: [event] });
	}
	return groups;
}

const upcomingLabel = (event: ManagerEvent) => {
	if (!event.starts_at) return "No date yet";
	const date = new Date(event.starts_at);
	return yearName.format(date) === thisYear ? monthName.format(date) : monthKey.format(date);
};
const pastLabel = (event: ManagerEvent) => (event.ends_at ? yearName.format(new Date(event.ends_at)) : "No date");

function Pager({ page, limit, total, noun, onPage }: { page: number; limit: number; total: number; noun: string; onPage: (page: number) => void }) {
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

function EmptyBox({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
	return (
		<div className="grid justify-items-start gap-2 rounded-2xl border border-dashed border-auth-field bg-auth-page px-6 py-7 sm:px-8">
			<h2 className="text-[18px] font-bold text-auth-ink">{title}</h2>
			<p className="max-w-[60ch] text-[15px] leading-normal text-auth-muted">{text}</p>
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}

const TILES = [false, true, false, true, "lit", true, false, true, false] as const;

function FirstEvent({ onCreate }: { onCreate: () => void }) {
	return (
		<section
			aria-labelledby="first-event"
			className="flex flex-wrap items-center gap-x-8 gap-y-6 rounded-2xl border border-dashed border-auth-field bg-auth-page p-6 sm:p-10"
		>
			<span aria-hidden="true" className="grid w-[168px] shrink-0 grid-cols-3 gap-1.5">
				{TILES.map((tile, index) => (
					<span
						key={index}
						className={classNames(
							"aspect-square rounded-lg",
							tile === "lit" ? "bg-accent-1000" : tile ? "bg-auth-line" : "bg-auth-info-soft"
						)}
					/>
				))}
			</span>
			<div className="grid min-w-0 flex-[1_1_360px] justify-items-start gap-2">
				<h2 id="first-event" className="text-[20px] font-bold text-auth-ink">
					Create your first event
				</h2>
				<p className="max-w-[56ch] text-[15px] leading-normal text-auth-muted">
					Start with a name and how guests get in. It stays a draft until you publish it, so nothing goes live while you set it up.
				</p>
				<p className="max-w-[56ch] text-[15px] leading-normal text-auth-muted">Every event you create, publish or finish lives here.</p>
				<button
					type="button"
					onClick={onCreate}
					className="mt-2 inline-flex h-11 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600"
				>
					<Plus aria-hidden="true" className="size-[18px]" />
					Create event
				</button>
			</div>
		</section>
	);
}

const VIEW_EMPTY: Record<Exclude<EventsView, "all">, { title: string; text: string }> = {
	upcoming: { title: "Nothing coming up", text: "Events you publish show here until they end." },
	drafts: { title: "No drafts", text: "New events wait here until you publish them." },
	past: { title: "No past events yet", text: "Events show here once they end, with their tickets and album." },
};

function ListSkeleton() {
	return (
		<div className="grid gap-2.5" aria-hidden="true">
			<Skeleton className="h-5 w-32" />
			<div className="grid gap-px overflow-hidden rounded-[14px] border border-auth-line">
				{[0, 1, 2].map((row) => (
					<div key={row} className="flex items-center gap-4 bg-white px-4 py-3.5">
						<Skeleton className="size-16 rounded-[10px]" />
						<div className="grid flex-1 gap-2">
							<Skeleton className="h-4 w-64 max-w-full" />
							<Skeleton className="h-3.5 w-80 max-w-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function Results({ data, view, search, onView, onPage, onClear }: {
	data: ManagerEventsPage;
	view: EventsView;
	search: string;
	onView: (view: EventsView) => void;
	onPage: (page: number) => void;
	onClear: () => void;
}) {
	const noMatches = (
		<EmptyBox
			title={`No events match “${search.trim()}”`}
			text="Search looks at event names, venues and cities. Try one word, or check the spelling."
			action={
				<button
					type="button"
					onClick={onClear}
					className="inline-flex h-10 items-center rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink hover:border-auth-field-hover"
				>
					Clear search
				</button>
			}
		/>
	);

	if (view === "all" && data.sections) {
		const { live, upcoming, drafts, past } = data.sections;
		if (data.total === 0) return search ? noMatches : null;
		return (
			<>
				<Group id="live" title="Live now" events={live.items} />
				<Group
					id="upcoming"
					title="Upcoming"
					count={upcoming.total}
					events={upcoming.items}
					footer={upcoming.total > upcoming.items.length && <SeeAll label={`See all ${formatCount(upcoming.total)} upcoming events`} onClick={() => onView("upcoming")} />}
				/>
				<Group
					id="drafts"
					title="Drafts"
					count={drafts.total}
					events={drafts.items}
					footer={drafts.total > drafts.items.length && <SeeAll label={`See all ${formatCount(drafts.total)} drafts`} onClick={() => onView("drafts")} />}
				/>
				<Group
					id="past"
					title="Past"
					count={past.total}
					events={past.items}
					footer={past.total > past.items.length && <SeeAll label={`See all ${formatCount(past.total)} past events`} onClick={() => onView("past")} />}
				/>
			</>
		);
	}

	const items = data.items ?? [];
	if (!items.length) {
		if (search) return noMatches;
		const empty = VIEW_EMPTY[view as Exclude<EventsView, "all">];
		return <EmptyBox title={empty.title} text={empty.text} />;
	}

	let groups: { id: string; title: string; events: ManagerEvent[] }[];
	if (view === "upcoming") {
		const live = items.filter((event) => event.status === "live");
		groups = [
			...(live.length ? [{ id: "live", title: "Live now", events: live }] : []),
			...groupBy(items.filter((event) => event.status !== "live"), upcomingLabel).map((group, index) => ({ id: `month-${index}`, title: group.label, events: group.events })),
		];
	} else if (view === "past") {
		groups = groupBy(items, pastLabel).map((group, index) => ({ id: `year-${index}`, title: group.label, events: group.events }));
	} else {
		groups = [{ id: "drafts", title: "Drafts", events: items }];
	}

	return (
		<>
			{groups.map((group) => (
				<Group key={group.id} id={group.id} title={group.title} count={view === "upcoming" ? group.events.length : undefined} events={group.events} />
			))}
			<Pager page={data.page} limit={data.limit} total={data.total} noun={view === "past" ? "past events" : view === "drafts" ? "drafts" : "upcoming events"} onPage={onPage} />
		</>
	);
}

export default function EventsList() {
	const { ui } = useActions();
	const { view, search, page, update } = useListState();
	const query = useQuery({
		queryKey: ["manager-events", view, search, page],
		queryFn: () => getManagerEvents({ view, search, page, limit: PAGE_SIZE[view] }),
		placeholderData: (previous) => previous,
	});
	const openCreate = () => ui.changeDialog({ show: true, type: "create_event" });
	const setSearch = React.useCallback((value: string) => update({ search: value }), [update]);

	const data = query.data;
	const brandNew = data && data.counts.all === 0 && !search;

	return (
		<div className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pb-16 pt-6 sm:px-8 lg:px-10">
			<h1 className="text-[24px] font-bold tracking-[-0.01em] text-auth-ink">Events</h1>

			{brandNew ? (
				<FirstEvent onCreate={openCreate} />
			) : (
				<>
					<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
						<SearchBox value={search} onChange={setSearch} />
						<ViewChips view={view} counts={data?.counts} onChange={(next) => update({ view: next })} />
					</div>

					<div className={classNames("grid gap-8", query.isFetching && query.isPlaceholderData && "opacity-60 transition-opacity")} aria-busy={query.isFetching}>
						{data ? (
							<Results
								data={data}
								view={view}
								search={search}
								onView={(next) => update({ view: next })}
								onPage={(next) => {
									update({ page: next });
									window.scrollTo({ top: 0 });
								}}
								onClear={() => update({ search: "" })}
							/>
						) : query.isError ? (
							<DashboardError onRetry={() => query.refetch()} isRetrying={query.isFetching} />
						) : (
							<ListSkeleton />
						)}
					</div>
				</>
			)}
		</div>
	);
}
