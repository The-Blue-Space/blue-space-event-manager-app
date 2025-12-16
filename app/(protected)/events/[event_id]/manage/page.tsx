import ManagerEvent from "@/features/events/manage-event";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Manage Event",
	description: "Setup and manage the details of your event",
});

export default function ManagerEventPage() {
	return <ManagerEvent />;
}
