import AppLayout from "@/layout/app-layout";
import "./globals.css";
import { generateMetadata } from "@/lib/generate-metadata";
import { Manrope } from "next/font/google";


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
				{/* <Suspense fallback={<LoadingBox type="screen" position="center" load_type="spinner" />}> */}
					<AppLayout>{children}</AppLayout>
				{/* </Suspense> */}
			</body>
		</html>
	);
}
