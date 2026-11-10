
import Settings from "@/features/settings";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Settings",
	description: "Your organizer profile, and the defaults your events start with.",
});

export default function Page() {
	return <Settings />;
}
