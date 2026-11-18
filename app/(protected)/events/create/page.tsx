import OpenCreateEvent from "@/features/events/list/open-create-event";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Create Event",
	description: "Create a new event",
});

export default function CreateEventPage() {
	return <OpenCreateEvent />;
}
