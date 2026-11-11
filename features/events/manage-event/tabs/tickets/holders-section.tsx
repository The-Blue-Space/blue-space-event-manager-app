"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { controlClass } from "@/components/app/field";
import SelectField from "@/components/app/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import ensureError from "@/lib/ensure-error";
import getEventUserTickets from "@/services/events/get-event-user-tickets";
import revokeUserTicket from "@/services/events/revoke-user-ticket";
import useActions from "@/store/actions";
import { UserTicket } from "@/types/user-ticket.types";
import { timeLabel } from "../basic-info/lagos-time";
import { commas, dayMonth, instant, nairaFromKoboExact } from "./format";
import { EmptyBox, PillTone, RowMenu, SectionTitle, Sheet, StatusPill, sectionClass } from "./ui";
import { TicketsData } from "./use-tickets";

const PAGE = 10;
const ALL = "all";

function holderStatus(holder: UserTicket): { label: string; tone: PillTone } {
	const status = holder.ticket_status as string;
	if (status === "paid")
		return holder.is_used ? { label: "Checked in", tone: "neutral" } : { label: "Valid", tone: "success" };
	if (status === "revoked") return { label: "Revoked", tone: "neutral" };
	if (status === "refunded") return { label: "Refunded", tone: "neutral" };
	if (status === "pending") return { label: "Pending", tone: "warning" };
	if (status === "failed") return { label: "Failed", tone: "error" };
	return { label: status.charAt(0).toUpperCase() + status.slice(1), tone: "neutral" };
}

const canRevoke = (holder: UserTicket) => holder.ticket_status === "paid" && !holder.is_used;

/** "10 Nov, 9:41 AM" */
function boughtLabel(iso: string) {
	const at = instant(iso);
	return at === null ? "" : `${dayMonth(at)}, ${timeLabel(at)}`;
}

function usePhone() {
	const [phone, setPhone] = React.useState(false);
	React.useEffect(() => {
		const query = window.matchMedia("(max-width: 639px)");
		const update = () => setPhone(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return phone;
}

export default function HoldersSection({ data, eventId }: { data: TicketsData; eventId: string }) {
	const { ui } = useActions();
	const phone = usePhone();
	const [search, setSearch] = React.useState("");
	const [query, setQuery] = React.useState("");
	const [ticketId, setTicketId] = React.useState(ALL);
	const [page, setPage] = React.useState(1);
	const [shown, setShown] = React.useState(PAGE);
	const [viewing, setViewing] = React.useState<UserTicket | null>(null);

	// Wait for a pause in typing before searching.
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setQuery(search.trim());
			setPage(1);
			setShown(PAGE);
		}, 300);
		return () => clearTimeout(timer);
	}, [search]);

	const filtered = Boolean(query) || ticketId !== ALL;
	// Phones grow one list with "Show more"; wider screens page through it.
	const params = phone ? { page: 1, limit: Math.min(shown, 100) } : { page, limit: PAGE };
	const holders = useQuery({
		queryKey: ["event-user-tickets", eventId, params.page, params.limit, query, ticketId],
		queryFn: () =>
			getEventUserTickets({ eventId, ...params, search: query, ticketId: ticketId === ALL ? undefined : ticketId }),
		placeholderData: (previous) => previous,
	});

	const docs = holders.data?.docs ?? [];
	const total = holders.data?.totalDocs ?? 0;
	const published = data.times.published;

	const revoke = (holder: UserTicket) =>
		ui.changeDialog({
			show: true,
			type: "delete_dialog",
			staticData: {
				title: "Revoke this ticket?",
				text: `${holder.user?.name ?? "This guest"}’s ticket ${holder.ticket_code ?? ""} stops working at the door. We refund what they paid and email them.`,
				showTitle: true,
				showText: true,
				showActionButton: true,
				showDismissButton: true,
				actionButtonText: "Revoke",
				dismissButtonText: "Cancel",
				actionButtonVariant: "destructive",
				dismissAfterAction: true,
			},
			action: async () => {
				try {
					const result = await revokeUserTicket({ eventId, ticketId: holder.id });
					toast.success(
						result?.refund_amount
							? `Ticket revoked. ${nairaFromKoboExact(result.refund_amount)} is on its way back to them.`
							: "Ticket revoked."
					);
					setViewing(null);
					data.refresh();
				} catch (error) {
					toast.error(ensureError(error).message);
				}
			},
		});

	let body: React.ReactNode;
	if (holders.isLoading) {
		body = <Skeleton className="h-48 w-full rounded-[14px]" />;
	} else if (holders.isError) {
		body = (
			<EmptyBox
				title="We couldn’t load ticket holders"
				text={ensureError(holders.error).message}
				action={
					<button
						type="button"
						onClick={() => holders.refetch()}
						className="text-[14px] font-semibold text-auth-link hover:text-primary-500"
					>
						Try again
					</button>
				}
			/>
		);
	} else if (!total && !filtered) {
		body = (
			<EmptyBox
				title="No ticket holders yet"
				text={
					published
						? "Everyone who buys a ticket shows up here, with their ticket code."
						: "Everyone who buys a ticket shows up here once you publish, with their ticket code."
				}
			/>
		);
	} else {
		const from = phone ? 1 : (page - 1) * PAGE + 1;
		const to = phone ? docs.length : Math.min(page * PAGE, total);
		body = (
			<>
				<div className="flex flex-wrap gap-2.5">
					<div className="relative min-w-0 max-w-[420px] flex-[1_1_280px]">
						<Search aria-hidden="true" className="absolute left-3.5 top-[11px] size-[18px] text-auth-muted" />
						<label htmlFor="holder-search" className="sr-only">
							Search ticket holders
						</label>
						<input
							id="holder-search"
							type="search"
							autoComplete="off"
							placeholder="Search by name or ticket code"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className={controlClass(false, "h-10 pl-[42px] text-[14px]")}
						/>
					</div>
					{data.tickets.length > 1 && (
						<div className="w-full sm:w-[220px] [&_button]:!h-10 [&_button]:text-[14px]">
							<label htmlFor="holder-type" className="sr-only">
								Ticket type
							</label>
							<SelectField
								id="holder-type"
								value={ticketId}
								options={[
									{ value: ALL, label: "All ticket types" },
									...data.tickets.map((t) => ({ value: t.id, label: t.name })),
								]}
								onChange={(value) => {
									setTicketId(value);
									setPage(1);
									setShown(PAGE);
								}}
								placeholder="All ticket types"
							/>
						</div>
					)}
				</div>

				{!docs.length ? (
					<p className="rounded-[14px] border border-auth-line px-5 py-6 text-[14px] text-auth-muted">
						No tickets match your search.
					</p>
				) : phone ? (
					<ul className="divide-y divide-auth-info-soft rounded-[14px] border border-auth-line">
						{docs.map((holder) => {
							const status = holderStatus(holder);
							return (
								<li key={holder.id} className="flex items-center gap-3 py-3 pl-4 pr-2">
									<div className="grid min-w-0 flex-1 gap-0.5">
										<span className="truncate text-[14px] font-bold">{holder.user?.name ?? "Guest"}</span>
										<span className="truncate text-[13px] text-auth-muted">
											{holder.ticket?.name} · <span className="font-mono">{holder.ticket_code}</span>
										</span>
									</div>
									<StatusPill tone={status.tone} dot={false}>
										{status.label}
									</StatusPill>
									<RowMenu
										label={`Actions for ticket ${holder.ticket_code ?? ""}`}
										items={[
											{ label: "View", onSelect: () => setViewing(holder) },
											...(canRevoke(holder) ? [{ label: "Revoke", onSelect: () => revoke(holder), danger: true }] : []),
										]}
									/>
								</li>
							);
						})}
					</ul>
				) : (
					<div className="overflow-x-auto rounded-[14px] border border-auth-line">
						<table className="w-full min-w-[760px] border-collapse text-[14px]">
							<thead>
								<tr className="bg-auth-page text-left text-[12px] text-auth-muted">
									<th scope="col" className="px-[18px] py-2.5 font-semibold">
										Name
									</th>
									<th scope="col" className="px-3 py-2.5 font-semibold">
										Ticket type
									</th>
									<th scope="col" className="px-3 py-2.5 font-semibold">
										Ticket code
									</th>
									<th scope="col" className="px-3 py-2.5 font-semibold">
										Bought
									</th>
									<th scope="col" className="px-3 py-2.5 font-semibold">
										Status
									</th>
									<th scope="col" className="px-[18px] py-2.5 text-right font-semibold">
										<span className="sr-only">Actions</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{docs.map((holder) => {
									const status = holderStatus(holder);
									return (
										<tr key={holder.id} className="border-t border-auth-info-soft">
											<td className="px-[18px] py-3">
												<span className="block font-bold">{holder.user?.name ?? "Guest"}</span>
												{holder.user?.username && (
													<span className="block text-[13px] text-auth-muted">@{holder.user.username}</span>
												)}
											</td>
											<td className="p-3">{holder.ticket?.name}</td>
											<td className="p-3 font-mono text-[13px]">{holder.ticket_code}</td>
											<td className="p-3 text-auth-muted">{boughtLabel(holder.created_at)}</td>
											<td className="p-3">
												<StatusPill tone={status.tone} dot={false}>
													{status.label}
												</StatusPill>
											</td>
											<td className="whitespace-nowrap px-[18px] py-3 text-right">
												<button
													type="button"
													onClick={() => setViewing(holder)}
													className="h-8 px-2.5 font-semibold text-auth-link hover:text-primary-500"
												>
													View
												</button>
												{canRevoke(holder) && (
													<button
														type="button"
														onClick={() => revoke(holder)}
														className="h-8 px-2.5 font-semibold text-auth-error hover:text-auth-error-ink"
													>
														Revoke
													</button>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				{docs.length > 0 &&
					(phone ? (
						docs.length < total && (
							<button
								type="button"
								onClick={() => setShown((count) => count + PAGE)}
								disabled={holders.isFetching}
								className="h-11 rounded-lg border border-auth-field bg-white text-[14px] font-semibold text-auth-ink"
							>
								Show more
							</button>
						)
					) : (
						<div className="flex flex-wrap items-center justify-between gap-3">
							<span className="text-[13px] text-auth-muted">
								Showing {commas(from)} to {commas(to)} of {commas(total)} {total === 1 ? "ticket" : "tickets"}
							</span>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setPage((value) => value - 1)}
									disabled={page <= 1 || holders.isFetching}
									className="h-9 rounded-lg border border-auth-field bg-white px-3 text-[14px] font-semibold text-auth-ink disabled:border-auth-line disabled:text-[#8E8DB0]"
								>
									Previous
								</button>
								<button
									type="button"
									onClick={() => setPage((value) => value + 1)}
									disabled={page * PAGE >= total || holders.isFetching}
									className="h-9 rounded-lg border border-auth-field bg-white px-3 text-[14px] font-semibold text-auth-ink disabled:border-auth-line disabled:text-[#8E8DB0]"
								>
									Next
								</button>
							</div>
						</div>
					))}
			</>
		);
	}

	return (
		<section aria-labelledby="holders-title" className={sectionClass}>
			<SectionTitle
				id="holders-title"
				title="Ticket holders"
				text={total || filtered ? "Every ticket bought for this event, one row per ticket." : undefined}
			/>
			{body}
			<HolderSheet holder={viewing} onClose={() => setViewing(null)} onRevoke={revoke} />
		</section>
	);
}

function HolderSheet({
	holder,
	onClose,
	onRevoke,
}: {
	holder: UserTicket | null;
	onClose: () => void;
	onRevoke: (holder: UserTicket) => void;
}) {
	// Keep the last holder while the panel slides away.
	const [shown, setShown] = React.useState<UserTicket | null>(holder);
	React.useEffect(() => {
		if (holder) setShown(holder);
	}, [holder]);
	const current = holder ?? shown;
	const status = current ? holderStatus(current) : null;
	const usedAt = instant(current?.used_at);
	const rows: [string, React.ReactNode][] = current
		? [
				["Ticket type", current.ticket?.name],
				[
					"Ticket code",
					<span key="code" className="font-mono">
						{current.ticket_code}
					</span>,
				],
				["Bought", boughtLabel(current.created_at)],
				[
					"Status",
					status && (
						<StatusPill key="status" tone={status.tone} dot={false}>
							{status.label}
						</StatusPill>
					),
				],
				...(usedAt !== null
					? ([["Checked in", `${dayMonth(usedAt)}, ${timeLabel(usedAt)}`]] as [string, React.ReactNode][])
					: []),
				["Email", current.user?.email],
				["Username", current.user?.username ? `@${current.user.username}` : null],
			]
		: [];

	return (
		<Sheet
			open={Boolean(holder)}
			onClose={onClose}
			title={current?.user?.name ?? "Ticket"}
			subtitle="Ticket holder"
			submitLabel=""
		>
			<dl className="grid gap-4">
				{rows
					.filter(([, value]) => value)
					.map(([label, value]) => (
						<div key={label} className="grid gap-1">
							<dt className="text-[13px] font-semibold text-auth-muted">{label}</dt>
							<dd className="text-[15px] font-medium text-auth-ink">{value}</dd>
						</div>
					))}
			</dl>
			{current && canRevoke(current) && (
				<button
					type="button"
					onClick={() => {
						onClose();
						onRevoke(current);
					}}
					className="self-start text-[14px] font-semibold text-auth-error hover:text-auth-error-ink"
				>
					Revoke ticket
				</button>
			)}
		</Sheet>
	);
}
