import EventPage from "@/features/events/event-page";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Event",
	description: "Set up, publish and follow your event",
});

export default function EventRoute() {
	return <EventPage />;
}
