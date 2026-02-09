"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type GlassVariant = "default" | "hero" | "subtle";

interface GlassCardProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	variant?: GlassVariant;
}

const variantClasses: Record<GlassVariant, string> = {
	default: "glass-card",
	hero: "glass-card-hero",
	subtle: "glass-card",
};

export function GlassCard({
	children,
	className = "",
	delay = 0,
	variant = "default",
}: GlassCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.5,
				delay,
				ease: [0.25, 0.46, 0.45, 0.94],
			}}
			className={`${variantClasses[variant]} p-5 ${className}`}
		>
			{children}
		</motion.div>
	);
}
