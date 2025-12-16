import * as React from "react";
import AppDialog from "@/components/app/app-dialog";
import AppButton from "@/components/app/app-button";
import AppCheckbox from "@/components/app/app-checkbox";
import AppSwitch from "@/components/app/app-switch";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Ticket, Gift, Tags, Users, Loader2 } from "lucide-react";
import useDuplicateEventDialog from "./use-duplicate-event-dialog";
import { cn } from "@/lib/utils";

export default function DuplicateEventDialog() {
	const {
		isOpen,
		previewData,
		isLoadingPreview,
		previewError,
		isDuplicating,
		isTicketBasedEvent,
		hasTickets,
		hasAddons,
		hasPromos,
		hasAttendees,
		includeTickets,
		setIncludeTickets,
		includeAddons,
		setIncludeAddons,
		includePromos,
		setIncludePromos,
		reinviteAttendees,
		setReinviteAttendees,
		handleClose,
		handleSubmit,
	} = useDuplicateEventDialog();

	const formatDate = (dateString?: string) => {
		if (!dateString) return "TBD";
		return new Date(dateString).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const footer = (
		<div className="flex justify-between w-full pt-2 border-t border-neutral-200">
			<AppButton variant="outline" onClick={handleClose} disabled={isDuplicating}>
				Cancel
			</AppButton>
			<AppButton onClick={handleSubmit} isLoading={isDuplicating} variant="primary">
				Duplicate Event
			</AppButton>
		</div>
	);

	return (
		<AppDialog
			open={isOpen}
			onClose={handleClose}
			title="Duplicate Event"
			description="Select what to include in the duplicated event"
			footer={footer}
			containerClassName="max-w-lg"
		>
			{isLoadingPreview ? (
				<div className="flex flex-col items-center justify-center py-12 gap-3">
					<Loader2 className="w-8 h-8 animate-spin text-primary-500" />
					<p className="body-2 text-neutral-500">Loading event details...</p>
				</div>
			) : previewError ? (
				<div className="text-center py-8">
					<p className="body-2 text-red-500">Failed to load event details</p>
				</div>
			) : previewData ? (
				<div className="space-y-6 py-2">
					{/* Event Preview Card */}
					<div className="flex gap-4 p-3 bg-neutral-50 rounded-lg">
						{previewData.event.cover_image ? (
							<img
								src={previewData.event.cover_image}
								alt={previewData.event.title}
								className="w-20 h-20 rounded-lg object-cover"
							/>
						) : (
							<div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center">
								<CalendarDays className="w-8 h-8 text-primary-500" />
							</div>
						)}
						<div className="flex-1 min-w-0">
							<h4 className="body-2 font-semibold text-neutral-800 truncate">
								{previewData.event.title}
							</h4>
							<div className="flex items-center gap-1 mt-1">
								<CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
								<span className="body-3 text-neutral-500">
									{formatDate(previewData.event.event_start_date)}
								</span>
							</div>
							{previewData.event.location && (
								<div className="flex items-center gap-1 mt-0.5">
									<MapPin className="w-3.5 h-3.5 text-neutral-400" />
									<span className="body-3 text-neutral-500 truncate">
										{previewData.event.location}
									</span>
								</div>
							)}
							<Badge variant="outline" className="mt-2 capitalize">
								{previewData.event.access_type.replace("-", " ")}
							</Badge>
						</div>
					</div>

					{/* Include Options */}
					<div className="space-y-3">
						<h5 className="body-2 font-medium text-neutral-700">Include in duplicate:</h5>

						{/* Tickets */}
						<label
							className={cn(
								"flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
								hasTickets
									? "border-neutral-200 hover:bg-neutral-50"
									: "border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed"
							)}
						>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full bg-blue-50">
									<Ticket className="w-4 h-4 text-blue-500" />
								</div>
								<div>
									<span className="body-2 font-medium text-neutral-700">Tickets</span>
									<p className="body-3 text-neutral-500">
										{hasTickets
											? `${previewData.tickets.length} ticket type(s)`
											: "No tickets to include"}
									</p>
								</div>
							</div>
							<AppCheckbox
								checked={includeTickets && hasTickets}
								onCheckedChange={(checked) => setIncludeTickets(checked === true)}
								disabled={!hasTickets}
							/>
						</label>

						{/* Addons */}
						<label
							className={cn(
								"flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
								hasAddons
									? "border-neutral-200 hover:bg-neutral-50"
									: "border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed"
							)}
						>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full bg-green-50">
									<Gift className="w-4 h-4 text-green-500" />
								</div>
								<div>
									<span className="body-2 font-medium text-neutral-700">Add-ons</span>
									<p className="body-3 text-neutral-500">
										{hasAddons
											? `${previewData.addons.length} add-on(s)`
											: "No add-ons to include"}
									</p>
								</div>
							</div>
							<AppCheckbox
								checked={includeAddons && hasAddons}
								onCheckedChange={(checked) => setIncludeAddons(checked === true)}
								disabled={!hasAddons}
							/>
						</label>

						{/* Promos */}
						<label
							className={cn(
								"flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
								hasPromos && includeTickets
									? "border-neutral-200 hover:bg-neutral-50"
									: "border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed"
							)}
						>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-full bg-purple-50">
									<Tags className="w-4 h-4 text-purple-500" />
								</div>
								<div>
									<span className="body-2 font-medium text-neutral-700">Ticket Promos</span>
									<p className="body-3 text-neutral-500">
										{hasPromos
											? `${previewData.promos.length} promo(s)`
											: "No promos to include"}
										{hasPromos && !includeTickets && " (requires tickets)"}
									</p>
								</div>
							</div>
							<AppCheckbox
								checked={includePromos && hasPromos && includeTickets}
								onCheckedChange={(checked) => setIncludePromos(checked === true)}
								disabled={!hasPromos || !includeTickets}
							/>
						</label>

						{/* Attendee Re-invitation (only for non-ticket events) */}
						{!isTicketBasedEvent && hasAttendees && (
							<label
								className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-full bg-orange-50">
										<Users className="w-4 h-4 text-orange-500" />
									</div>
									<div>
										<span className="body-2 font-medium text-neutral-700">
											Re-invite Attendees
										</span>
										<p className="body-3 text-neutral-500">
											{`${previewData.previous_attendees.length} previous attendee(s)`}
										</p>
									</div>
								</div>
								<AppSwitch
									checked={reinviteAttendees}
									onCheckedChange={setReinviteAttendees}
								/>
							</label>
						)}
					</div>
				</div>
			) : null}
		</AppDialog>
	);
}
