import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
				outline: "border border-input bg-background hover:bg-accent",
				ghost: "hover:bg-accent hover:text-accent-foreground",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-6",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants>) {
	return (
		<button
			className={cn(buttonVariants({ variant, size, className }))}
			data-slot="button"
			{...props}
		/>
	);
}

export { Button, buttonVariants };
