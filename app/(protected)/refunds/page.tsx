import Refunds from "@/features/refunds";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Refunds",
	description: "Manage and track your refunds and refund requests",
});

export default function Page() {
	return <Refunds />;
}
