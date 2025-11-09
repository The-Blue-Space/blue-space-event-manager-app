import { generateMetadata } from "@/lib/generate-metadata";
import EventDetails from "@/features/events/event-details";

export const metadata = generateMetadata({
	title: "Event Details",
	description: "View and manage the details of your event",
});

export default function EventDetailsPage() {
	return <EventDetails />;
}
