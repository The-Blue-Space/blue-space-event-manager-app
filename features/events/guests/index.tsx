"use client";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { Ban, Check, Copy, Download, MoreHorizontal, RefreshCw, Ticket, UserPlus } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events/manage-event/context";
import { DashboardError } from "@/features/home/dashboard/states";
import { formatCount } from "@/features/home/dashboard/format";
import { Pill } from "@/features/home/dashboard/ui";
import ensureError from "@/lib/ensure-error";
import {
	approveGuest,
	blockGuest,
	declineGuest,
	getGuests,
	inviteAgain,
	invitePeople,
	resetEventCode,
	unblockGuest,
	withdrawInvite,
} from "@/services/guests";
import { EventAccessType } from "@/types/event-summary.types";
import { Guest, GuestFilter } from "@/types/guests.types";
import InviteSheet from "./invite-sheet";
import { Avatar, Chips, Pager, Person, SearchBox, outlineButton, primaryButton, when } from "./ui";

const PAGE_SIZE = 20;
const TILES = [false, true, false, true, "lit", true, false, true, false] as const;

type Tone = "success" | "neutral" | "warning" | "error";

/** What a guest's row says about them, and the date that goes with it. */
function describe(guest: Guest, accessType: EventAccessType): { label: string; tone: Tone; dated: string } {
	if (guest.is_blocked) return { label: "Blocked", tone: "error", dated: `Blocked ${when(guest.since)}` };
	if (guest.tickets.length || guest.status === "joined") return { label: "Joined", tone: "success", dated: `Joined ${when(guest.since)}` };
	switch (guest.status) {
		case "invited":
			return { label: "Invited", tone: "neutral", dated: `Invited ${when(guest.since)}` };
		case "rejected":
			return { label: "Declined", tone: "error", dated: `Declined ${when(guest.since)}` };
		case "retracted":
			return { label: "Withdrawn", tone: "neutral", dated: `Withdrawn ${when(guest.since)}` };
		default:
			return { label: accessType === "individual" ? "Waiting for you" : "Waiting", tone: "warning", dated: `Asked ${when(guest.asked)}` };
	}
}

/** "Regular × 2, VIP" */
const ticketSummary = (guest: Guest) => guest.tickets.map((ticket) => (ticket.count > 1 ? `${ticket.name} × ${ticket.count}` : ticket.name)).join(", ");

type Asking = { kind: "block" | "unblock" | "withdraw" | "new-code"; guest?: Guest } | null;

function RowMenu({ guest, ticketed, onAsk, onTickets }: { guest: Guest; ticketed: boolean; onAsk: (asking: Asking) => void; onTickets: (guest: Guest) => void }) {
	const item = "flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[14px] font-semibold focus:bg-auth-page";
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				aria-label={`More actions for ${guest.name}`}
				className="grid size-9 shrink-0 place-items-center rounded-lg text-auth-muted transition-colors hover:bg-auth-page hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-link data-[state=open]:bg-auth-page"
			>
				<MoreHorizontal aria-hidden="true" className="size-[18px]" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[220px] rounded-xl border-auth-line bg-white p-1.5 font-manrope text-auth-ink shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]">
				{ticketed && guest.tickets.length > 0 && (
					<DropdownMenuItem className={classNames(item, "text-auth-ink")} onSelect={() => onTickets(guest)}>
						<Ticket aria-hidden="true" className="size-4 text-auth-muted" />
						See their tickets
					</DropdownMenuItem>
				)}
				{guest.is_blocked ? (
					<DropdownMenuItem className={classNames(item, "text-auth-ink")} onSelect={() => onAsk({ kind: "unblock", guest })}>
						<Check aria-hidden="true" className="size-4 text-auth-muted" />
						Unblock
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem className={classNames(item, "text-auth-error focus:text-auth-error")} onSelect={() => onAsk({ kind: "block", guest })}>
						<Ban aria-hidden="true" className="size-4" />
						Block from this event
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function CodeCard({ code, qrCode, onNewCode }: { code: string | null; qrCode: string | null; onNewCode: () => void }) {
	const copy = async () => {
		if (!code) return;
		try {
			await navigator.clipboard.writeText(code);
			toast.success("Code copied");
		} catch {
			toast.error("We couldn’t copy the code.");
		}
	};
	const download = async () => {
		if (!qrCode) return;
		try {
			const blob = await (await fetch(qrCode)).blob();
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = "event-qr-code.png";
			link.click();
			URL.revokeObjectURL(link.href);
		} catch {
			window.open(qrCode, "_blank", "noopener");
		}
	};
	return (
		<section aria-labelledby="event-code" className="flex flex-wrap items-start gap-x-8 gap-y-6 rounded-[14px] border border-auth-line bg-white p-6">
			<div className="grid min-w-0 flex-[1_1_420px] gap-4">
				<div className="grid gap-1">
					<h2 id="event-code" className="text-[18px] font-bold text-auth-ink">
						Event code
					</h2>
					<p className="text-[14px] text-auth-muted">Everyone uses the same code. Guests type it in the Blue Space app or scan the QR code to join.</p>
				</div>
				<p className="font-mono text-[36px] font-bold tracking-[0.18em] text-auth-ink" aria-label={code ? `Code ${code.split("").join(" ")}` : undefined}>
					{code ?? "No code yet"}
				</p>
				<div className="flex flex-wrap gap-2">
					<button type="button" onClick={copy} disabled={!code} className={primaryButton}>
						<Copy aria-hidden="true" className="size-4" />
						Copy code
					</button>
					{qrCode && (
						<button type="button" onClick={download} className={outlineButton}>
							<Download aria-hidden="true" className="size-4" />
							Download QR code
						</button>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-auth-line pt-4">
					<button type="button" onClick={onNewCode} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-auth-link hover:text-primary-500">
						<RefreshCw aria-hidden="true" className="size-4" />
						Get a new code
					</button>
					<span className="text-[13px] text-auth-muted">The old code stops working. People who already joined stay in.</span>
				</div>
			</div>
			{qrCode && (
				<span className="relative grid size-[180px] shrink-0 place-items-center rounded-xl border border-auth-line bg-white p-3">
					<Image src={qrCode} alt="QR code for this event" width={156} height={156} className="size-[156px] object-contain" unoptimized />
				</span>
			)}
		</section>
	);
}

function InviteEmpty({ onInvite }: { onInvite: () => void }) {
	return (
		<section aria-labelledby="invite-empty" className="flex flex-wrap items-center gap-x-8 gap-y-6 rounded-2xl border border-dashed border-auth-field bg-auth-page p-6 sm:p-8">
			<span aria-hidden="true" className="grid w-[132px] shrink-0 grid-cols-3 gap-1.5">
				{TILES.map((tile, index) => (
					<span key={index} className={classNames("aspect-square rounded-lg", tile === "lit" ? "bg-accent-1000" : tile ? "bg-auth-line" : "bg-auth-info-soft")} />
				))}
			</span>
			<div className="grid min-w-0 flex-[1_1_360px] justify-items-start gap-2">
				<h2 id="invite-empty" className="text-[18px] font-bold text-auth-ink">
					Invite your guests
				</h2>
				<p className="max-w-[60ch] text-[15px] leading-normal text-auth-muted">
					Find each guest by their email or Blue Space username. They get an email with the event details and their own code to get in.
				</p>
				<p className="max-w-[60ch] text-[15px] leading-normal text-auth-muted">People can also ask to join from the app. They wait here until you approve them.</p>
				<button type="button" onClick={onInvite} className={classNames(primaryButton, "mt-2")}>
					<UserPlus aria-hidden="true" className="size-4" />
					Invite guests
				</button>
			</div>
		</section>
	);
}

export default function GuestsTab({ eventId }: { eventId: string }) {
	const { event } = useEvent();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [filter, setFilter] = React.useState<GuestFilter>("all");
	const [search, setSearch] = React.useState("");
	const [page, setPage] = React.useState(1);
	const [note, setNote] = React.useState("");
	const [inviting, setInviting] = React.useState(false);
	const [asking, setAsking] = React.useState<Asking>(null);
	const [busy, setBusy] = React.useState<string | null>(null);

	const query = useQuery({
		queryKey: ["guests", eventId, filter, search, page],
		queryFn: () => getGuests({ eventId, filter, search, page, limit: PAGE_SIZE }),
		placeholderData: (previous) => previous,
	});
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
		queryClient.invalidateQueries({ queryKey: ["event-summary", eventId] });
		queryClient.invalidateQueries({ queryKey: ["manager-events"] });
	};
	const changeFilter = (next: GuestFilter) => {
		setFilter(next);
		setPage(1);
	};
	const changeSearch = React.useCallback((next: string) => {
		setSearch(next);
		setPage(1);
	}, []);

	/** Runs one guest action, then says what happened in the line above the list. */
	const act = async (guest: Guest, action: () => Promise<unknown>, done: string) => {
		setBusy(guest.id);
		try {
			await action();
			setNote(done);
			refresh();
		} catch (error) {
			toast.error(ensureError(error).message || "That didn’t work. Try again.");
		} finally {
			setBusy(null);
		}
	};

	const data = query.data;
	const accessType: EventAccessType = data?.access_type ?? (event?.access_type as EventAccessType) ?? "ticket-based";
	const ticketed = accessType === "ticket-based";
	const inviteOnly = accessType === "individual";
	const title = event?.title ?? "this event";

	const openTickets = (guest: Guest) => router.push(`/events/${eventId}?tab=tickets&holder=${encodeURIComponent(guest.email)}`);

	if (!data) {
		if (query.isError) return <DashboardError onRetry={() => query.refetch()} isRetrying={query.isFetching} />;
		return (
			<div className="grid gap-4" aria-hidden="true">
				<Skeleton className="h-7 w-40" />
				<Skeleton className="h-64 w-full rounded-[14px]" />
			</div>
		);
	}

	const counts = data.counts;
	const nobodyYet = counts.all + counts.waiting + counts.blocked === 0 && !search;

	const chips: { id: GuestFilter; label: string; count: number }[] = inviteOnly
		? [
				{ id: "all", label: "All", count: counts.all },
				{ id: "invited", label: "Invited", count: counts.invited },
				...(counts.joined ? [{ id: "joined" as const, label: "Joined", count: counts.joined }] : []),
				{ id: "declined", label: "Declined", count: counts.declined },
				{ id: "withdrawn", label: "Withdrawn", count: counts.withdrawn },
				...(counts.blocked ? [{ id: "blocked" as const, label: "Blocked", count: counts.blocked }] : []),
			]
		: [
				{ id: "all", label: "All", count: counts.all },
				...(counts.invited && !ticketed ? [{ id: "invited" as const, label: "Invited", count: counts.invited }] : []),
				...(counts.declined ? [{ id: "declined" as const, label: "Declined", count: counts.declined }] : []),
				...(counts.withdrawn ? [{ id: "withdrawn" as const, label: "Withdrawn", count: counts.withdrawn }] : []),
				...(counts.blocked || filter === "blocked" ? [{ id: "blocked" as const, label: "Blocked", count: counts.blocked }] : []),
			];
	const showChips = chips.length > 1;

	const intro = ticketed ? (
		<>
			Everyone who buys a ticket is added here, one row per person. Tickets, check-in and refunds are on the{" "}
			<button type="button" onClick={() => router.push(`/events/${eventId}?tab=tickets`)} className="font-semibold text-auth-link hover:text-primary-500">
				Tickets
			</button>{" "}
			tab.
		</>
	) : inviteOnly ? (
		[`${formatCount(counts.invited + counts.joined)} invited`, counts.waiting ? `${formatCount(counts.waiting)} waiting for you` : ""].filter(Boolean).join(" · ")
	) : accessType === "general" ? (
		`${counts.joined === 1 ? "1 person has" : `${formatCount(counts.joined)} people have`} joined with the code.`
	) : (
		"Anyone can join from the Blue Space app. Everyone who joined shows here."
	);

	const noun = filter === "all" ? "people" : filter === "blocked" ? "blocked" : filter;
	const emptyText: Record<GuestFilter, string> = {
		all: search ? `No one matches “${search}”.` : ticketed ? "No one has bought a ticket yet." : "No one has joined yet.",
		waiting: "No one is waiting.",
		invited: "No one is invited yet.",
		joined: "No one has joined yet.",
		declined: "No declined requests.",
		withdrawn: "No withdrawn invites.",
		blocked: "No one is blocked.",
	};

	return (
		<div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
			{accessType === "general" && <CodeCard code={event?.access_code ?? null} qrCode={event?.qr_code ?? null} onNewCode={() => setAsking({ kind: "new-code" })} />}

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="grid max-w-[64ch] gap-1">
					<h2 className="text-[20px] font-bold text-auth-ink">Guests</h2>
					<p className="text-[14px] text-auth-muted">{nobodyYet && inviteOnly ? "No one yet" : intro}</p>
				</div>
				{!(nobodyYet && inviteOnly) && (
					<button type="button" onClick={() => setInviting(true)} className={inviteOnly ? primaryButton : outlineButton}>
						<UserPlus aria-hidden="true" className="size-4" />
						Invite guests
					</button>
				)}
			</div>

			{note && (
				<p role="status" className="flex w-fit items-center gap-2 rounded-lg bg-auth-success-soft px-3.5 py-2.5 text-[14px] font-semibold text-auth-success">
					<Check aria-hidden="true" className="size-4" />
					{note}
				</p>
			)}

			{nobodyYet && inviteOnly ? (
				<InviteEmpty onInvite={() => setInviting(true)} />
			) : (
				<>
					{!ticketed && (data.waiting.length > 0 || inviteOnly) && (
						<section aria-labelledby="waiting" className={classNames("rounded-[14px]", data.waiting.length ? "border border-auth-line bg-white" : "border border-dashed border-auth-field bg-auth-page")}>
							{data.waiting.length ? (
								<>
									<div className="grid gap-1 px-5 pb-3 pt-4">
										<h3 id="waiting" className="text-[16px] font-bold text-auth-ink">
											Waiting for you <span className="font-medium text-auth-muted">{formatCount(counts.waiting)}</span>
										</h3>
										<p className="text-[13px] text-auth-muted">
											They asked to join from the Blue Space app. {inviteOnly ? "Approving sends them their own code by email." : "Approving lets them in and emails them."} Declining lets them know.
										</p>
									</div>
									<ul className="divide-y divide-auth-line border-t border-auth-line">
										{data.waiting.map((guest) => (
											<li key={guest.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
												<Avatar name={guest.name} />
												<span className="grid min-w-0 flex-1">
													<span className="truncate text-[14px]">
														<strong className="font-bold text-auth-ink">{guest.name}</strong>
														{guest.username && <span className="text-auth-muted"> @{guest.username}</span>}
													</span>
													<span className="text-[13px] text-auth-muted">Asked {when(guest.asked)}</span>
												</span>
												<div className="flex w-full gap-2 pl-12 sm:w-auto sm:pl-0">
													<button
														type="button"
														disabled={busy === guest.id}
														onClick={() => act(guest, () => declineGuest(guest.id), `Declined. We emailed ${guest.name} to let them know.`)}
														className={outlineButton}
													>
														Decline
													</button>
													<button
														type="button"
														disabled={busy === guest.id}
														onClick={() =>
															act(guest, () => approveGuest(guest.id), inviteOnly ? `Approved. We emailed ${guest.name} their own code.` : `Approved. We emailed ${guest.name}.`)
														}
														className={primaryButton}
													>
														Approve
													</button>
												</div>
											</li>
										))}
									</ul>
								</>
							) : (
								<div className="grid gap-1 px-5 py-4">
									<h3 id="waiting" className="text-[14px] font-bold text-auth-ink">
										No one is waiting
									</h3>
									<p className="text-[13px] text-auth-muted">When someone asks to join from the Blue Space app, they show up here.</p>
								</div>
							)}
						</section>
					)}

					<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
						{showChips ? <Chips items={chips} value={filter} onChange={changeFilter} /> : <span />}
						<SearchBox value={search} onChange={changeSearch} label="Search guests" />
					</div>

					<div className={classNames("overflow-hidden rounded-[14px] border border-auth-line bg-white", query.isPlaceholderData && "opacity-60 transition-opacity")}>
						<table className="w-full border-collapse text-left">
							<thead className="hidden bg-auth-page text-[13px] font-semibold text-auth-muted sm:table-header-group">
								<tr>
									<th scope="col" className="px-4 py-3">Name</th>
									{ticketed && <th scope="col" className="px-4 py-3">Tickets</th>}
									<th scope="col" className="px-4 py-3">Status</th>
									{!inviteOnly && <th scope="col" className="px-4 py-3">Joined</th>}
									<th scope="col" className="w-0 px-4 py-3"><span className="sr-only">Actions</span></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-auth-line">
								{data.items.map((guest) => {
									const status = describe(guest, accessType);
									const action = guest.is_blocked
										? null
										: guest.status === "invited" && !guest.tickets.length
											? { label: "Withdraw invite", danger: true, run: () => setAsking({ kind: "withdraw", guest }) }
											: guest.status === "retracted"
												? { label: "Invite again", danger: false, run: () => act(guest, () => inviteAgain(guest.id), `Invited again. We emailed ${guest.name}.`) }
												: guest.status === "rejected"
													? { label: "Invite", danger: false, run: () => act(guest, () => invitePeople(eventId, [guest.user_id]), `Invited. We emailed ${guest.name}.`) }
													: null;
									return (
										<tr key={guest.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 sm:table-row sm:p-0">
											<td className="flex min-w-0 flex-[1_1_0%] items-center gap-3 sm:px-4 sm:py-3">
												<Avatar name={guest.name} />
												<Person guest={guest} />
											</td>
											{ticketed && <td className="order-3 w-full pl-12 text-[14px] text-auth-ink sm:order-none sm:w-auto sm:px-4 sm:py-3">{ticketSummary(guest) || "No tickets yet"}</td>}
											<td className="order-4 pl-12 sm:order-none sm:px-4 sm:py-3">
												<div className="grid justify-items-start gap-0.5">
													<Pill tone={status.tone}>{status.label}</Pill>
													{inviteOnly && <span className="text-[13px] text-auth-muted">{status.dated}</span>}
												</div>
											</td>
											{!inviteOnly && <td className="order-5 text-[13px] text-auth-muted sm:order-none sm:px-4 sm:py-3 sm:text-[14px]">{when(guest.since)}</td>}
											<td className="order-2 ml-auto sm:order-none sm:px-4 sm:py-3">
												<div className="flex items-center justify-end gap-1">
													{action && (
														<button
															type="button"
															disabled={busy === guest.id}
															onClick={action.run}
															className={classNames("whitespace-nowrap px-2 text-[14px] font-semibold disabled:opacity-60", action.danger ? "text-auth-error hover:text-auth-error-ink" : "text-auth-link hover:text-primary-500")}
														>
															{action.label}
														</button>
													)}
													<RowMenu guest={guest} ticketed={ticketed} onAsk={setAsking} onTickets={openTickets} />
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						{data.items.length === 0 && <p className="px-4 py-10 text-center text-[14px] text-auth-muted">{emptyText[filter]}</p>}
					</div>

					<Pager page={data.page} limit={data.limit} total={data.total} noun={noun} onPage={setPage} />
				</>
			)}

			<InviteSheet
				open={inviting}
				onClose={() => setInviting(false)}
				eventId={eventId}
				eventTitle={title}
				accessType={accessType}
				isPrivate={data.is_private}
				onInvited={refresh}
			/>

			<ConfirmDialog
				open={asking?.kind === "block"}
				onOpenChange={(open) => !open && setAsking(null)}
				title={`Block ${asking?.guest?.name ?? "this guest"}?`}
				text={`They can’t get into ${title}, and we email them to say so. ${ticketed ? "Their ticket stays as it is. To refund it, revoke it on the Tickets tab. " : ""}You can unblock them later from Blocked.`}
				confirmLabel="Block"
				icon={<Ban />}
				onConfirm={async () => {
					if (!asking?.guest) return;
					await blockGuest(asking.guest.id);
					setNote(`${asking.guest.name} is blocked. We emailed them.`);
					refresh();
				}}
			/>
			<ConfirmDialog
				open={asking?.kind === "unblock"}
				onOpenChange={(open) => !open && setAsking(null)}
				title={`Unblock ${asking?.guest?.name ?? "this guest"}?`}
				text="They can get in again with their ticket or code."
				confirmLabel="Unblock"
				tone="primary"
				icon={<Check />}
				onConfirm={async () => {
					if (!asking?.guest) return;
					await unblockGuest(asking.guest.id);
					setNote(`${asking.guest.name} is unblocked.`);
					refresh();
				}}
			/>
			<ConfirmDialog
				open={asking?.kind === "withdraw"}
				onOpenChange={(open) => !open && setAsking(null)}
				title={`Withdraw ${asking?.guest?.name ?? "this guest"}’s invite?`}
				text="We email them to let them know, and their code stops working. You can invite them again later."
				confirmLabel="Withdraw invite"
				icon={<Ban />}
				onConfirm={async () => {
					if (!asking?.guest) return;
					await withdrawInvite(asking.guest.id);
					setNote(`Invite withdrawn. We emailed ${asking.guest.name}, and their code stops working.`);
					refresh();
				}}
			/>
			<ConfirmDialog
				open={asking?.kind === "new-code"}
				onOpenChange={(open) => !open && setAsking(null)}
				title="Get a new code?"
				text="The old code stops working straight away, so share the new one with anyone who hasn’t joined yet. People who already joined stay in."
				confirmLabel="Get a new code"
				tone="primary"
				icon={<RefreshCw />}
				onConfirm={async () => {
					await resetEventCode(eventId);
					await queryClient.invalidateQueries({ queryKey: ["event-details", eventId] });
					toast.success("New code ready. The old one no longer works.");
				}}
			/>
		</div>
	);
}

