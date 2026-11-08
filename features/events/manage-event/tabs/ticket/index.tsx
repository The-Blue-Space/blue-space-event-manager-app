"use client";
import { Ticket, TicketX } from "lucide-react";
import SectionWrapper from "../../section-wrapper";
import TabContainer from "../../tab-container";
import TicketList from "./ticket-list";
import TicketAddonTab from "./ticket-addon";
import useActions from "@/store/actions";
import AppButton from "@/components/app/app-button";
import TicketDialogs from "./dialogs";
import { useEvent } from "../../context";
import React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import useCustomNavigation from "@/hooks/use-navigation";
import updateEventAccessType from "@/services/events/update-event-access-type";

export default function AgendaTab() {
	const { ui } = useActions();
	const { accessType, changeTab } = useEvent();
	const queryClient = useQueryClient();
	const { params } = useCustomNavigation();
	const eventId = params.event_id as string;

	const [switching, setSwitching] = React.useState(false);

	const handleAddTicket = () => {
		ui.changeDialog({
			show: true,
			type: "add_event_ticket",
		});
	};

	const handleSwitchToTicketBased = async () => {
		try {
			setSwitching(true);
			await updateEventAccessType({ event_id: eventId, access_type: "ticket-based" });
			await queryClient.invalidateQueries({ queryKey: ["event-details", eventId] });
			toast.success("Event switched to ticket-based");
		} catch {
			toast.error("Failed to switch access type. Please try again.");
		} finally {
			setSwitching(false);
		}
	};

	if (accessType !== "ticket-based") {
		return (
			<TabContainer value="ticket" className="!max-w-5xl">
				<div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
					<span className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100">
						<TicketX className="w-8 h-8 text-neutral-400" />
					</span>
					<div className="space-y-1">
						<h3 className="body-1 font-semibold text-neutral-800">Ticketing not enabled</h3>
						<p className="body-3 text-neutral-500 max-w-sm">
							This event is not configured for ticketing. Switch to ticket-based to start creating and
							managing tickets.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<AppButton
							variant="primary"
							onClick={handleSwitchToTicketBased}
							isLoading={switching}
						>
							Switch to Ticket-based
						</AppButton>
						<AppButton variant="outline" onClick={() => changeTab("basic-information")}>
							Go to Basic Information
						</AppButton>
					</div>
				</div>
			</TabContainer>
		);
	}

	return (
		<TabContainer value="ticket" className="!max-w-5xl">
			<SectionWrapper
				title="Event Tickets"
				icon={<Ticket className="w-5 h-5 text-primary-500" />}
				description="Create and manage tickets and promotions for your event"
				showSaveButton={false}
				showCancelButton={false}
				editComponent={
					<AppButton variant="outline" onClick={handleAddTicket}>
						Add Ticket
					</AppButton>
				}
			>
				{(sectionMode) => (sectionMode === "view" ? <TicketList /> : null)}
			</SectionWrapper>

			<TicketAddonTab />

			<TicketDialogs />
		</TabContainer>
	);
}
