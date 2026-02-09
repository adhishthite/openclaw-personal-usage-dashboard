import { Analytics } from "@vercel/analytics/react";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
	? process.env.NEXT_PUBLIC_SITE_URL
	: process.env.NEXT_PUBLIC_VERCEL_URL
		? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
		: "https://openclaw-personal-usage-dashboard.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "OpenClaw Observatory",
		template: "%s | OpenClaw Observatory",
	},
	description:
		"Personal OpenClaw usage analytics dashboard for cost, token, model, and session intelligence.",
	keywords: [
		"OpenClaw",
		"LLM analytics",
		"usage dashboard",
		"token tracking",
		"AI cost dashboard",
		"Convex",
	],
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "OpenClaw Observatory",
		description:
			"Track model usage, costs, tokens, cache performance, and session activity in one dashboard.",
		url: "/",
		siteName: "OpenClaw Observatory",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/icon.svg",
				width: 512,
				height: 512,
				alt: "OpenClaw Observatory",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "OpenClaw Observatory",
		description:
			"Track model usage, costs, tokens, cache performance, and sessions.",
		images: ["/icon.svg"],
	},
	icons: {
		icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
		apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
	},
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
				<Analytics />
			</body>
		</html>
	);
}
