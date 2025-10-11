import LoadingBox from "@/components/app/loading-box";
import VerifyMFA from "@/features/auth/verify-mfa";
import { generateMetadata } from "@/lib/generate-metadata";
import { Suspense } from "react";

export const metadata = generateMetadata({
	title: "Verify MFA",
	description: "Verify MFA",
});

export default function VerifyMFAPage() {
	return (
		<Suspense fallback={<LoadingBox />}>
			<VerifyMFA />
		</Suspense>
	);
}
