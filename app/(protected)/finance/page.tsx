import Finance from "@/features/finance";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Finance",
	description: "Manage and monitor your finance",
});

export default function Page() {
	return <Finance />;
}
