import LoadingBox from "@/components/app/loading-box";
import ResetPassword from "@/features/auth/reset-password";
import { generateMetadata } from "@/lib/generate-metadata";
import { Suspense } from "react";

export const metadata = generateMetadata({
	title: "Set a new password",
	description: "Set a new password for your Blue Space account.",
});

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<LoadingBox type="screen" position="center" />}>
			<ResetPassword />
		</Suspense>
	);
}
