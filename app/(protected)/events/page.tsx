import Events from "@/features/events";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Events",
	description: "Manage and monitor your events",
});

export default function Page() {
	return <Events />;
}
