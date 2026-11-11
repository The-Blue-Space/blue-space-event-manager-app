"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardError } from "@/features/home/dashboard/states";
import ensureError from "@/lib/ensure-error";
import deleteEventAddon from "@/services/events/event-addons/delete-event-addon";
import toggleAddonStatus from "@/services/events/event-addons/toggle-addon-status";
import deleteTicketPromo from "@/services/events/event-ticket-promos/delete-ticket-promo";
import updateTicketPromo from "@/services/events/event-ticket-promos/update-ticket-promo";
import deleteEventTicket from "@/services/events/event-tickets/delete-event-ticket";
import toggleTicketStatus from "@/services/events/event-tickets/toggle-ticket-status";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { EventTicket, EventTicketAddon, EventTicketPromo } from "@/types/event-ticket.types";
import AddonSheet, { AddonSheetState } from "./addon-sheet";
import DiscountSheet, { DiscountSheetState } from "./discount-sheet";
import { AddonsSection, DiscountsSection } from "./extras-sections";
import HoldersSection from "./holders-section";
import NotSelling from "./not-selling";
import TicketSheet, { TicketSheetState } from "./ticket-sheet";
import TypesSection from "./types-section";
import useTickets from "./use-tickets";

type TicketsTabProps = {
	eventId: string;
	/** Opens another tab of the event page, e.g. Guests. */
	onNavigate: (tab: "guests") => void;
};

function TicketsWorkspace({ eventId, onNavigate }: TicketsTabProps) {
	const data = useTickets(eventId);
	const { summary, event, tickets, promos, addons, times, refresh } = data;
	const { ui } = useActions();
	const { account } = useAppSelector("account");
	const queryClient = useQueryClient();

	const [ticketSheet, setTicketSheet] = React.useState<TicketSheetState>({ open: false, ticket: null });
	const [discountSheet, setDiscountSheet] = React.useState<DiscountSheetState>({ open: false, promo: null });
	const [addonSheet, setAddonSheet] = React.useState<AddonSheetState>({ open: false, addon: null });
	const [busyId, setBusyId] = React.useState<string | null>(null);

	if (!event) {
		return summary.isError ? (
			<DashboardError onRetry={() => summary.refetch()} isRetrying={summary.isFetching} />
		) : (
			<Skeleton className="h-64 w-full max-w-[880px] rounded-[14px]" />
		);
	}

	if (event.access_type !== "ticket-based") {
		return (
			<NotSelling
				eventId={eventId}
				accessType={event.access_type}
				published={event.published}
				onGuests={() => onNavigate("guests")}
				onChanged={() => {
					refresh();
					queryClient.invalidateQueries({ queryKey: ["event-details", eventId] });
				}}
			/>
		);
	}

	// Runs one change, keeps that row's switch busy meanwhile, then refreshes everything.
	const run = async (id: string, change: () => Promise<unknown>, done?: string) => {
		setBusyId(id);
		try {
			await change();
			if (done) toast.success(done);
		} catch (error) {
			toast.error(ensureError(error).message);
		} finally {
			setBusyId(null);
			refresh();
		}
	};

	const confirm = (title: string, text: string, actionButtonText: string, action: () => Promise<void>) =>
		ui.changeDialog({
			show: true,
			type: "delete_dialog",
			staticData: {
				title,
				text,
				showTitle: true,
				showText: true,
				showActionButton: true,
				showDismissButton: true,
				actionButtonText,
				dismissButtonText: "Cancel",
				actionButtonVariant: "destructive",
				dismissAfterAction: true,
			},
			action,
		});

	const removeTicket = (ticket: EventTicket) => {
		setTicketSheet((prev) => ({ ...prev, open: false }));
		confirm(`Remove ${ticket.name}?`, "Guests won’t see it any more. Nobody has bought it yet.", "Remove", () =>
			run(ticket.id, () => deleteEventTicket({ id: ticket.id }), `${ticket.name} removed.`)
		);
	};

	const togglePromo = (promo: EventTicketPromo) =>
		run(promo.id, () =>
			updateTicketPromo({
				promoId: promo.id,
				ticket_id: promo.ticket_id,
				promo_type: promo.promo_type,
				name: promo.name,
				is_active: !promo.is_active,
				sales_start_date: promo.sales_start_date,
			})
		);
	const removePromo = (promo: EventTicketPromo) =>
		confirm(
			`Remove ${promo.name}?`,
			"Guests stop getting this discount. Tickets already bought keep their price.",
			"Remove",
			() => run(promo.id, () => deleteTicketPromo({ promoId: promo.id, userId: account.id }), `${promo.name} removed.`)
		);

	const toggleAddon = (addon: EventTicketAddon) =>
		run(addon.id, () => toggleAddonStatus({ id: addon.id, is_active: !addon.is_active }));
	const removeAddon = (addon: EventTicketAddon) =>
		confirm(`Remove ${addon.name}?`, "Guests can’t buy it any more.", "Remove", () =>
			run(addon.id, () => deleteEventAddon({ id: addon.id }), `${addon.name} removed.`)
		);

	const promoTicketIds = new Set(promos.map((promo) => promo.ticket_id));
	const paid = tickets.filter((ticket) => ticket.type === "paid");
	const openForDiscount = paid.filter((ticket) => !promoTicketIds.has(ticket.id));
	const editingPromo = discountSheet.promo;
	const discountTypes = editingPromo ? paid.filter((ticket) => ticket.id === editingPromo.ticket_id) : openForDiscount;

	return (
		<div className="grid max-w-[880px] grid-cols-[minmax(0,1fr)] gap-10 pt-2">
			<TypesSection
				data={data}
				busyId={busyId}
				onAdd={(name) => setTicketSheet({ open: true, ticket: null, name })}
				onEdit={(ticket) => setTicketSheet({ open: true, ticket })}
				onToggle={(ticket) =>
					run(ticket.id, () => toggleTicketStatus({ id: ticket.id, eventId, is_active: !ticket.is_active }))
				}
				onRemove={removeTicket}
			/>
			<DiscountsSection
				promos={promos}
				tickets={tickets}
				open={openForDiscount}
				published={times.published}
				busyId={busyId}
				onAdd={() => setDiscountSheet({ open: true, promo: null })}
				onEdit={(promo) => setDiscountSheet({ open: true, promo })}
				onToggle={togglePromo}
				onRemove={removePromo}
			/>
			<AddonsSection
				addons={addons}
				tickets={tickets}
				published={times.published}
				busyId={busyId}
				onAdd={() => setAddonSheet({ open: true, addon: null })}
				onEdit={(addon) => setAddonSheet({ open: true, addon })}
				onToggle={toggleAddon}
				onRemove={removeAddon}
			/>
			<HoldersSection data={data} eventId={eventId} />

			<TicketSheet
				state={ticketSheet}
				onClose={() => setTicketSheet((prev) => ({ ...prev, open: false }))}
				data={data}
				eventId={eventId}
				eventTitle={event.title}
				onRemove={removeTicket}
			/>
			<DiscountSheet
				state={discountSheet}
				onClose={() => setDiscountSheet((prev) => ({ ...prev, open: false }))}
				data={data}
				eventId={eventId}
				eventTitle={event.title}
				ticketTypes={discountTypes}
			/>
			<AddonSheet
				state={addonSheet}
				onClose={() => setAddonSheet((prev) => ({ ...prev, open: false }))}
				data={data}
				eventId={eventId}
				eventTitle={event.title}
			/>
		</div>
	);
}

/** The event page's Tickets tab: ticket types, discounts, add-ons and ticket holders. */
export default function TicketsTab(props: TicketsTabProps) {
	return (
		<TabsContent value="ticket" className="mt-5">
			<TicketsWorkspace {...props} />
		</TabsContent>
	);
}
