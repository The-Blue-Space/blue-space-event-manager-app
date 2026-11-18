"use client";
import * as React from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import classNames from "classnames";
import { Check, X } from "lucide-react";
import { controlClass } from "@/components/app/field";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount, formatShortDate, formatTime } from "@/features/home/dashboard/format";
import useDuplicateEventDialog from "./use-duplicate-event-dialog";

/** "Early bird, Regular and VIP" */
const listNames = (names: string[]) =>
	names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("") || "?";

const ACCESS_COPIED: Record<string, string> = {
	"ticket-based": "How guests get in, who can find it, and album settings",
	individual: "Invite only, who can find it, and album settings",
	general: "One code for everyone (with a new code), who can find it, and album settings",
	none: "Open to everyone, who can find it, and album settings",
};

function Box({ checked, onChange, title, text, disabled }: { checked: boolean; onChange: () => void; title: string; text: string; disabled?: boolean }) {
	return (
		<label className={classNames("flex gap-3 px-4 py-3.5", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
			<input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="mt-0.5 size-[18px] shrink-0 accent-primary-500" />
			<span className="grid gap-0.5">
				<span className="text-[15px] font-bold text-auth-ink">{title}</span>
				<span className="text-[13px] leading-normal text-auth-muted">{text}</span>
			</span>
		</label>
	);
}

export default function DuplicateEventDialog() {
	const d = useDuplicateEventDialog();
	const event = d.preview.data?.event;
	const when = event?.event_start_date ? `${formatShortDate(event.event_start_date)} · ${formatTime(event.event_start_date)}` : "";
	const meta = [when, event?.location].filter(Boolean).join(" · ");
	const notCopied = [
		"the date and time",
		"agenda and lineup",
		...(d.inviting ? [] : ["guests"]),
		...(d.isTicketed ? ["sales"] : []),
		"album photos",
	];

	return (
		<DialogPrimitive.Root open={d.isOpen} onOpenChange={(open) => !open && !d.isDuplicating && d.close()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(25,24,55,0.35)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
				<DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white font-manrope text-auth-ink shadow-[0_24px_64px_-24px_rgba(25,24,55,0.45)] focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none">
					<header className="flex items-start gap-4 border-b border-auth-line px-6 pb-4 pt-5">
						<div className="grid min-w-0 flex-1 gap-0.5">
							<DialogPrimitive.Title className="text-[18px] font-bold leading-snug">Duplicate {d.eventTitle}</DialogPrimitive.Title>
							<DialogPrimitive.Description className="text-[14px] text-auth-muted">Make a new draft from this event.</DialogPrimitive.Description>
						</div>
						<DialogPrimitive.Close aria-label="Close" className="-mr-2 grid size-9 place-items-center rounded-lg text-auth-muted hover:bg-auth-page hover:text-auth-ink">
							<X aria-hidden="true" className="size-5" />
						</DialogPrimitive.Close>
					</header>

					<form
						id="duplicate-event"
						noValidate
						onSubmit={(e) => {
							e.preventDefault();
							d.submit();
						}}
						className="grid flex-1 gap-6 overflow-y-auto px-6 py-5"
					>
						{d.preview.isLoading ? (
							<div className="grid gap-4" aria-hidden="true">
								<Skeleton className="h-[72px] w-full rounded-xl" />
								<Skeleton className="h-11 w-full rounded-lg" />
								<Skeleton className="h-32 w-full rounded-xl" />
							</div>
						) : d.preview.isError ? (
							<p className="text-[14px] text-auth-error">We couldn’t load this event. Close this and try again.</p>
						) : (
							<>
								<div className="flex items-center gap-3 rounded-xl bg-auth-page p-3">
									{event?.cover_image ? (
										<span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-auth-info-soft">
											<Image src={event.cover_image} alt="" fill sizes="48px" className="object-cover" />
										</span>
									) : (
										<span aria-hidden="true" className="size-12 shrink-0 rounded-lg bg-primary-500" />
									)}
									<div className="grid min-w-0 gap-0.5">
										<p className="truncate text-[15px] font-bold">{event?.title ?? d.eventTitle}</p>
										{meta && <p className="truncate text-[13px] text-auth-muted">{meta}</p>}
									</div>
								</div>

								<div className="grid gap-1.5">
									<label htmlFor="copy-name" className="text-[13px] font-semibold">
										Name of the copy
									</label>
									<input
										id="copy-name"
										value={d.title}
										onChange={(e) => d.setTitle(e.target.value)}
										onBlur={d.onTitleBlur}
										onFocus={(e) => e.currentTarget.select()}
										maxLength={150}
										aria-invalid={Boolean(d.titleError)}
										aria-describedby={d.titleError ? "copy-name-error" : undefined}
										className={controlClass(Boolean(d.titleError), "h-11")}
									/>
									{d.titleError && (
										<p id="copy-name-error" className="text-[13px] font-medium text-auth-error">
											{d.titleError}
										</p>
									)}
								</div>

								<div className="grid gap-2">
									<p className="text-[13px] font-semibold">Copied as it is</p>
									<ul className="grid gap-1.5">
										{[
											"Description, category and tags",
											"Venue and address",
											"Cover and event photos",
											"Overview, FAQs and good to know",
											ACCESS_COPIED[event?.access_type ?? "ticket-based"] ?? ACCESS_COPIED["ticket-based"],
										].map((item) => (
											<li key={item} className="flex items-start gap-2.5 text-[14px]">
												<Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-auth-success" />
												{item}
											</li>
										))}
									</ul>
								</div>

								{d.tickets.length > 0 && (
									<fieldset className="grid gap-2">
										<legend className="mb-2 text-[13px] font-semibold">Also copy</legend>
										<div className="divide-y divide-auth-line rounded-xl border border-auth-line">
											<Box
												checked={d.includeTickets}
												onChange={() => d.setIncludeTickets(!d.includeTickets)}
												title="Ticket types"
												text={`${formatCount(d.tickets.length)}: ${listNames(d.tickets.map((ticket) => ticket.name))}. Sold counts start again at zero.`}
											/>
											{d.addons.length > 0 && (
												<Box
													checked={d.includeAddons}
													onChange={() => d.setIncludeAddons(!d.includeAddons)}
													title="Add-ons"
													text={`${formatCount(d.addons.length)}: ${listNames(d.addons.map((addon) => addon.name))}.`}
												/>
											)}
											{d.promos.length > 0 && (
												<Box
													checked={d.includePromos && d.includeTickets}
													onChange={() => d.setIncludePromos(!d.includePromos)}
													disabled={!d.includeTickets}
													title="Discounts"
													text={`${formatCount(d.promos.length)}: ${listNames(d.promos.map((promo) => promo.code))}. They come with the ticket types.`}
												/>
											)}
										</div>
									</fieldset>
								)}

								{d.canInvite && (
									<fieldset className="grid gap-2">
										<legend className="mb-2 text-[13px] font-semibold">Invite guests from this event</legend>
										<div className="overflow-hidden rounded-xl border border-auth-line">
											<Box
												checked={d.inviteGuests}
												onChange={() => d.setInviteGuests(!d.inviteGuests)}
												title="Invite the same guests"
												text={`The ${formatCount(d.guests.length)} ${event?.access_type === "individual" ? (d.guests.length === 1 ? "person you invited" : "people you invited") : d.guests.length === 1 ? "person who joined" : "people who joined"}. Each gets their own invite by email when you publish the copy.`}
											/>
											{d.inviteGuests && (
												<>
													<div className="flex items-center justify-between gap-3 border-t border-auth-line bg-auth-page px-4 py-2.5">
														<p className="text-[13px] font-semibold" aria-live="polite">
															{formatCount(d.chosen.size)} of {formatCount(d.guests.length)} chosen
														</p>
														<div className="flex gap-3 text-[13px] font-semibold text-auth-link">
															<button type="button" onClick={d.chooseAll} className="hover:text-primary-500">
																Choose all
															</button>
															<button type="button" onClick={d.clearChosen} className="hover:text-primary-500">
																Clear
															</button>
														</div>
													</div>
													<ul className="max-h-[236px] divide-y divide-auth-info-soft overflow-y-auto border-t border-auth-line">
														{d.guests.map((guest) => (
															<li key={guest.id}>
																<label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-auth-page">
																	<input
																		type="checkbox"
																		checked={d.chosen.has(guest.id)}
																		onChange={() => d.toggleGuest(guest.id)}
																		className="size-[18px] shrink-0 accent-primary-500"
																	/>
																	<span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-auth-info-soft text-[12px] font-bold text-primary-500">
																		{initials(guest.name)}
																	</span>
																	<span className="grid min-w-0">
																		<span className="truncate text-[14px] font-semibold">{guest.name}</span>
																		<span className="truncate text-[13px] text-auth-muted">{guest.email}</span>
																	</span>
																</label>
															</li>
														))}
													</ul>
												</>
											)}
										</div>
									</fieldset>
								)}

								<p className="text-[13px] leading-normal text-auth-muted">
									Not copied: {listNames(notCopied)}. The copy starts as a draft, and you’ll pick its date next.
								</p>
							</>
						)}
					</form>

					<footer className="flex justify-end gap-3 border-t border-auth-line px-6 py-4">
						<DialogPrimitive.Close
							disabled={d.isDuplicating}
							className="h-11 rounded-lg px-4 text-[15px] font-semibold text-auth-muted hover:bg-auth-page hover:text-auth-ink disabled:opacity-60"
						>
							Cancel
						</DialogPrimitive.Close>
						<button
							type="submit"
							form="duplicate-event"
							disabled={d.isDuplicating || d.preview.isLoading || d.preview.isError}
							aria-busy={d.isDuplicating}
							className="h-11 rounded-lg bg-primary-500 px-5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-[#8E8DB0]"
						>
							{d.isDuplicating ? "Duplicating…" : "Duplicate"}
						</button>
					</footer>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
