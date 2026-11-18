import LoadingBox from "@/components/app/loading-box";
import ForgotPassword from "@/features/auth/forgot-password";
import { generateMetadata } from "@/lib/generate-metadata";
import { Suspense } from "react";

export const metadata = generateMetadata({
	title: "Reset password",
	description: "Get a link to reset your Blue Space password.",
});

export default function ForgotPasswordPage() {
	return (
		<Suspense fallback={<LoadingBox type="screen" position="center" />}>
			<ForgotPassword />
		</Suspense>
	);
}
