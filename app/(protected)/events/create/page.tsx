import UnderConstruction from "@/components/app/prompts/under-construction";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Create Event",
	description: "Create a new event",
});

export default function CreateEventPage() {
	return <UnderConstruction />;
}
