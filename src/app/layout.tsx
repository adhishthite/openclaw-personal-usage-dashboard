import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { ConvexClientProvider } from "@/lib/convex";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700"],
	variable: "--font-plex-sans",
});

const plexCondensed = IBM_Plex_Sans_Condensed({
	subsets: ["latin"],
	display: "swap",
	weight: ["500", "600", "700"],
	variable: "--font-plex-condensed",
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
			<body
				className={`${plexSans.variable} ${plexCondensed.variable} antialiased`}
			>
				<ConvexClientProvider>{children}</ConvexClientProvider>
			</body>
		</html>
	);
}
