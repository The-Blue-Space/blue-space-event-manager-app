import AppLayout from "@/layout/app-layout";
import "./globals.css";
import { generateMetadata } from "@/lib/generate-metadata";
import { Manrope } from "next/font/google";
import { Suspense } from "react";
import LoadingBox from "@/components/app/loading-box";

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

export const metadata = generateMetadata({
	title: "Login",
	description: "Login to your account",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${manrope.variable}`}>
				<Suspense fallback={<LoadingBox type="screen" position="center" />}>
					<AppLayout>{children}</AppLayout>
				</Suspense>
			</body>
		</html>
	);
}
