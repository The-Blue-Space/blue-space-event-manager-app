import Orders from "@/features/orders";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Orders",
	description: "View and manage all your orders",
});

export default function OrdersPage() {
	return <Orders />;
}
