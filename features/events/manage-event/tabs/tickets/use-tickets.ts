"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getEventAddons from "@/services/events/event-addons/get-event-addons";
import getEventTicketPromos from "@/services/events/event-ticket-promos/get-event-ticket-promos";
import getEventTickets from "@/services/events/event-tickets/get-event-tickets";
import getFeeBreakdown from "@/services/events/event-tickets/get-fee-breakdown";
import getEventSummary from "@/services/events/get-event-summary";
import useAppSelector from "@/store/hooks";
import { FeeRates } from "./fee-modes";
import { instant } from "./format";
import { EventTimes } from "./sales-window";

/** Everything the Tickets tab reads, plus one refresh for after a change. */
export default function useTickets(eventId: string) {
	const queryClient = useQueryClient();
	const { activeCurrency } = useAppSelector("init");
	const currencyId = activeCurrency?.id ?? null;

	// Same key as the event page, so the header and the Overview checklist stay in step.
	const summary = useQuery({ queryKey: ["event-summary", eventId], queryFn: () => getEventSummary(eventId) });
	const tickets = useQuery({
		queryKey: ["event-tickets", eventId],
		queryFn: () => getEventTickets({ event_Id: eventId }),
	});
	const promos = useQuery({
		queryKey: ["event-ticket-promos", eventId],
		queryFn: () => getEventTicketPromos({ eventId }),
	});
	const addons = useQuery({
		queryKey: ["event-addons", eventId],
		queryFn: () => getEventAddons({ event_Id: eventId }),
	});
	// The server's fee calculator holds the percentages; any price gives them back.
	const fees = useQuery({
		queryKey: ["ticket-fee-rates", eventId, currencyId],
		queryFn: () => getFeeBreakdown({ event_id: eventId, price: 100, currency_id: currencyId as string }),
		enabled: Boolean(currencyId),
		staleTime: Infinity,
	});

	const event = summary.data?.event;
	const times: EventTimes = React.useMemo(
		() => ({
			startsAt: instant(event?.starts_at),
			endsAt: instant(event?.ends_at),
			published: Boolean(event?.published),
		}),
		[event?.starts_at, event?.ends_at, event?.published]
	);

	// Sold counts come from paid tickets on the server, never from the stored sold_quantity.
	const sold = React.useMemo(() => {
		const map = new Map<string, number>();
		for (const tier of summary.data?.sales.tiers ?? []) map.set(tier.id, tier.sold);
		return map;
	}, [summary.data]);

	const rates: FeeRates | null = fees.data
		? { service: fees.data.service_fee.percentage, processing: fees.data.processing_fee.percentage }
		: null;

	const refresh = React.useCallback(() => {
		for (const key of [
			["event-tickets", eventId],
			["event-ticket-promos", eventId],
			["event-addons", eventId],
			["event-summary", eventId],
			["event-user-tickets", eventId],
			["home-dashboard"],
		]) {
			queryClient.invalidateQueries({ queryKey: key });
		}
	}, [queryClient, eventId]);

	return {
		summary,
		event,
		times,
		tickets: tickets.data ?? [],
		ticketsQuery: tickets,
		promos: promos.data ?? [],
		promosQuery: promos,
		addons: addons.data ?? [],
		addonsQuery: addons,
		sold,
		revenueKobo: summary.data?.sales.revenue_kobo ?? 0,
		rates,
		currencyId,
		refresh,
	};
}

export type TicketsData = ReturnType<typeof useTickets>;
