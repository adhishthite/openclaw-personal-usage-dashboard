import { cn } from "@/lib/utils";

function Progress({
	value = 0,
	className,
}: {
	value?: number;
	className?: string;
}) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div
			data-slot="progress"
			className={cn(
				"bg-secondary relative h-2 w-full overflow-hidden rounded-full",
				className,
			)}
		>
			<div
				className="bg-primary h-full transition-all"
				style={{ width: `${clamped}%` }}
			/>
		</div>
	);
}

export { Progress };
