import LoadingBox from "@/components/app/loading-box";
import VerifyEmail from "@/features/auth/verify-email";
import { generateMetadata } from "@/lib/generate-metadata";
import { Suspense } from "react";

export const metadata = generateMetadata({
	title: "Verify email",
	description: "Verify the email on your Blue Space account.",
});

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<LoadingBox type="screen" position="center" />}>
			<VerifyEmail />
		</Suspense>
	);
}
