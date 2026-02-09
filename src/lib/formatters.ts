export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

export function formatTokens(value: number): string {
	if (value >= 1_000_000_000) {
		return `${(value / 1_000_000_000).toFixed(1)}B`;
	}
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1_000) {
		return `${(value / 1_000).toFixed(1)}K`;
	}
	return value.toLocaleString();
}

export function formatNumber(value: number): string {
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1_000) {
		return `${(value / 1_000).toFixed(1)}K`;
	}
	return value.toLocaleString();
}

export function formatPercent(value: number): string {
	return `${value.toFixed(1)}%`;
}

export function formatDate(isoString: string): string {
	const date = new Date(isoString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatShortDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function maskName(name: string): string {
	if (name.length <= 2) return name;
	return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

export function maskSessionId(sessionId: string): string {
	if (sessionId.length <= 5) return sessionId;
	return `${sessionId.slice(0, 3)}***${sessionId.slice(-2)}`;
}
