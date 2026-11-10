import { EventAccessType, EventStatus, EventSummary } from "@/types/event-summary.types";

export type EventTab = "overview" | "details" | "tickets" | "media" | "agenda" | "vendors" | "guests" | "album";

export const ACCESS_LABEL: Record<EventAccessType, string> = {
	"ticket-based": "Sell tickets",
	general: "One code for everyone",
	individual: "Invite each guest",
	none: "Open to everyone",
};

export const STATUS: Record<EventStatus, { label: string; tone: "neutral" | "warning" | "success" }> = {
	draft: { label: "Draft", tone: "neutral" },
	scheduled: { label: "Scheduled", tone: "warning" },
	on_sale: { label: "On sale", tone: "success" },
	live: { label: "Live now", tone: "warning" },
	ended: { label: "Ended", tone: "neutral" },
};

/** "On sale" only makes sense when tickets are being sold; other published events are just "Published". */
export function statusFor({ status, access_type }: EventSummary["event"]) {
	if (status === "on_sale" && access_type !== "ticket-based") return { label: "Published", tone: "success" as const };
	return STATUS[status];
}

export type SetupStep = { key: string; title: string; detail: string; done: boolean; tab?: EventTab; action?: string };

/** What has to be in place before an event can be published, in the order the checklist shows it. */
export function setupSteps({ event, setup }: EventSummary): SetupStep[] {
	const steps: SetupStep[] = [
		{ key: "basics", title: "Name, description and category", detail: "Done when you created it.", done: true, tab: "details", action: "Edit" },
		{ key: "access", title: "How guests get in", detail: `${ACCESS_LABEL[event.access_type]}.`, done: true },
		{
			key: "schedule",
			title: "Date, time and venue",
			detail: "When it starts and ends, when doors open, and where guests should go.",
			done: setup.has_schedule && setup.has_venue,
			tab: "details",
			action: "Add details",
		},
		{
			key: "cover",
			title: "Cover image",
			detail: "The first thing guests see. 2100 × 900 px works best.",
			done: setup.has_cover,
			tab: "details",
			action: "Add cover",
		},
	];
	if (event.access_type === "ticket-based") {
		steps.push({
			key: "tickets",
			title: "Ticket types",
			detail:
				setup.ticket_types > 0
					? "Turn on at least one ticket type so guests can buy it. You need one to publish."
					: "Add at least one and put it on sale. You need one to publish.",
			done: setup.active_ticket_types > 0,
			tab: "tickets",
			action: setup.ticket_types > 0 ? "Turn one on" : "Add tickets",
		});
	}
	return steps;
}
