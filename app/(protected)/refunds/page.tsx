import UnderConstruction from "@/components/app/prompts/under-construction";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Refunds",
	description: "Manage and track your refunds and refunds requests",
});

export default function Page() {
	return <UnderConstruction />;
}
