import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ConvexClientProvider } from "@/lib/convex";
import "./globals.css";

const manrope = Manrope({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
	title: "OpenClaw Observatory",
	description: "LLM usage analytics dashboard",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
				<ConvexClientProvider>{children}</ConvexClientProvider>
			</body>
		</html>
	);
}
