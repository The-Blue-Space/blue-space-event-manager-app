"use client";
import { Ticket } from "lucide-react";
import SectionWrapper from "../../section-wrapper";
import TabContainer from "../../tab-container";
import TicketList from "./ticket-list";
import TicketAddonTab from "./ticket-addon";

import useActions from "@/store/actions";
import AppButton from "@/components/app/app-button";
import TicketDialogs from "./dialogs";

export default function AgendaTab() {
	const { ui } = useActions();

	const handleAddTicket = () => {
		ui.changeDialog({
			show: true,
			type: "add_event_ticket",
		});
	};
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

			{/* Addon Section */}
			<TicketAddonTab />

			<TicketDialogs />
		</TabContainer>
	);
}
