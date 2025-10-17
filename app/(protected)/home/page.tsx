import Home from "@/features/home";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Home",
	description: "Manage and monitor your events and orders",
});

export default function Page() {
	return <Home />;
}
