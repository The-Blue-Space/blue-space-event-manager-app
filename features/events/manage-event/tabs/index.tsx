import Agenda from "./agenda";
import BasicInfo from "./basic-info";
import Media from "./media";

export default function EventSetupTabs() {
	return (
		<>
			<BasicInfo />
			<Media />
			<Agenda />
		</>
	);
}
