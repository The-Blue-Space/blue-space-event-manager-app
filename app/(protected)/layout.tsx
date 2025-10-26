import { generateMetadata } from "@/lib/generate-metadata";

import AppSidebar from "@/components/app/app-sidebar";
import AuthGate, { AuthGateProvider } from "@/contexts/use-auth-gate";
import Dialogs from "@/dialogs";

export const metadata = generateMetadata({
	title: "Home",
	description: "Home",
});

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<AuthGateProvider>
			<AuthGate>
				<AppSidebar>{children}</AppSidebar>
				<Dialogs />
			</AuthGate>
		</AuthGateProvider>
	);
}
