import UnderConstruction from "@/components/app/prompts/under-construction";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Marketing",
	description: "Market and promote your events for more sales and engagement",
});

export default function Page() {
	return <UnderConstruction />;
}
