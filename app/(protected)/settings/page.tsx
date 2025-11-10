
import Settings from "@/features/settings";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Settings",
	description: "Manage your profile and event settings",
});

export default function Page() {
	return <Settings />;
}
