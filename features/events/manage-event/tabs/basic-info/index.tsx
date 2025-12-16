import TabContainer from "../../tab-container";
import CoverImageSection from "./cover-image-section";
import EventDetailsSection from "./event-details-section";
import ScheduleSection from "./schedule-section";
import LocationSection from "./location-section";
import OverviewSection from "./overview-section";
import GoodToKnow from "./good-to-know";

export default function BasicInfo() {
	return (
		<TabContainer value="basic-information">
			<CoverImageSection />
			<EventDetailsSection />
			<ScheduleSection />
			<LocationSection />
			<OverviewSection />
			<GoodToKnow />
		</TabContainer>
	);
}
