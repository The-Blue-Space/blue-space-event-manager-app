import LoadingBox from "@/components/app/loading-box";
import Register from "@/features/auth/register";
import { generateMetadata } from "@/lib/generate-metadata";
import { Suspense } from "react";

export const metadata = generateMetadata({
	title: "Create account",
	description: "Create a Blue Space account to run your events.",
});

export default function RegisterPage() {
	return (
		<Suspense fallback={<LoadingBox type="screen" position="center" />}>
			<Register />
		</Suspense>
	);
}
