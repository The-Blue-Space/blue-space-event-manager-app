import EditTicket from "./edit-ticket";
import NewTicket from "./new-ticket";
import TicketPromo from "./ticket-promo";
import AddonDialog from "./addon";

export default function TicketDialogs() {
	return (
		<>
			<NewTicket />
			<EditTicket />
			<TicketPromo />
			<AddonDialog />
		</>
	);
}
