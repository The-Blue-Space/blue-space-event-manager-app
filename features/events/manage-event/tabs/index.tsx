import Agenda from "./agenda";
import BasicInfo from "./basic-info";
import Media from "./media";
import Ticket from "./ticket";

export default function EventSetupTabs() {
	return (
		<>
			<BasicInfo />
			<Media />
			<Agenda />
			<Ticket />
		</>
	);
}
