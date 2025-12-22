import Agenda from "./agenda";
import BasicInfo from "./basic-info";
import Media from "./media";
import PublishTab from "./publish";
import Ticket from "./ticket";
import VendorTab from "./vendor";

export default function EventSetupTabs() {
	return (
		<>
			<BasicInfo />
			<Media />
			<Agenda />
			<Ticket />
			<VendorTab />
			<PublishTab />
		</>
	);
}
