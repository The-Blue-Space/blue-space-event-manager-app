import UnderConstruction from "@/components/app/prompts/under-construction";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Event Details",
	description: "View and manage the details of your event",
});

export default function EventDetailsPage() {
	return <UnderConstruction />;
}
