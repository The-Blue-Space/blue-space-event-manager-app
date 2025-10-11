import MFA from "@/features/auth/mfa";
import { generateMetadata } from "@/lib/generate-metadata";

export const metadata = generateMetadata({
	title: "Multi-Factor Authentication",
	description: "MFA",
});

export default function MFAPage() {
	return <MFA />;
}
