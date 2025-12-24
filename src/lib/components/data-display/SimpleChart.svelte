<script lang="ts">
	import { cn } from '$lib/utils';

	interface DataPoint {
		label: string;
		value: number;
	}

	interface Props {
		data: DataPoint[];
		type?: 'bar' | 'line';
		height?: number;
		class?: string;
		showLabels?: boolean;
		color?: string;
	}

	let {
		data,
		type = 'bar',
		height = 200,
		class: className = '',
		showLabels = true,
		color = 'var(--color-primary-500)'
	}: Props = $props();

	const width = 400;
	const padding = $derived({ top: 20, right: 20, bottom: showLabels ? 40 : 20, left: 40 });
	const chartWidth = $derived(width - padding.left - padding.right);
	const chartHeight = $derived(height - padding.top - padding.bottom);

	const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));
	const minValue = $derived(Math.min(...data.map((d) => d.value), 0));
	const range = $derived(maxValue - minValue || 1);

	const barWidth = $derived(data.length > 0 ? (chartWidth / data.length) * 0.7 : 0);
	const barGap = $derived(data.length > 0 ? (chartWidth / data.length) * 0.3 : 0);

	function getY(value: number): number {
		return chartHeight - ((value - minValue) / range) * chartHeight;
	}

	function getX(index: number): number {
		return (index * chartWidth) / (data.length - 1 || 1);
	}

	const linePath = $derived(
		data.length > 0
			? data
					.map((d, i) => {
						const x = padding.left + getX(i);
						const y = padding.top + getY(d.value);
						return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
					})
					.join(' ')
			: ''
	);

	const areaPath = $derived(
		data.length > 0
			? `${linePath} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`
			: ''
	);

	// Generate Y-axis labels
	const yAxisLabels = $derived([0, 0.25, 0.5, 0.75, 1].map((ratio) => {
		const value = minValue + range * (1 - ratio);
		return {
			value: Math.round(value),
			y: padding.top + chartHeight * ratio
		};
	}));
</script>

<div class={cn('w-full', className)} role="img" aria-label="圖表">
	<svg viewBox="0 0 {width} {height}" class="w-full" preserveAspectRatio="xMidYMid meet">
		<!-- Y-axis labels -->
		{#each yAxisLabels as { value, y }}
			<text
				x={padding.left - 8}
				{y}
				text-anchor="end"
				dominant-baseline="middle"
				class="text-xs fill-gray-400 dark:fill-gray-500"
			>
				{value}
			</text>
			<line
				x1={padding.left}
				y1={y}
				x2={padding.left + chartWidth}
				y2={y}
				class="stroke-gray-200 dark:stroke-gray-700"
				stroke-dasharray="4 2"
			/>
		{/each}

		{#if type === 'bar'}
			<!-- Bar chart -->
			{#each data as d, i}
				{@const barHeight = ((d.value - minValue) / range) * chartHeight}
				{@const x = padding.left + i * (barWidth + barGap) + barGap / 2}
				{@const y = padding.top + chartHeight - barHeight}
				<rect
					{x}
					{y}
					width={barWidth}
					height={barHeight}
					fill={color}
					rx="4"
					class="transition-all duration-300 hover:opacity-80"
				/>
				{#if showLabels}
					<text
						x={x + barWidth / 2}
						y={height - 10}
						text-anchor="middle"
						class="text-xs fill-gray-500 dark:fill-gray-400"
					>
						{d.label}
					</text>
				{/if}
			{/each}
		{:else}
			<!-- Line chart -->
			<!-- Area fill -->
			<path d={areaPath} fill={color} opacity="0.1" />
			<!-- Line -->
			<path d={linePath} fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			<!-- Data points -->
			{#each data as d, i}
				{@const x = padding.left + getX(i)}
				{@const y = padding.top + getY(d.value)}
				<circle cx={x} cy={y} r="4" fill={color} class="transition-all duration-300 hover:r-6" />
				{#if showLabels}
					<text
						{x}
						y={height - 10}
						text-anchor="middle"
						class="text-xs fill-gray-500 dark:fill-gray-400"
					>
						{d.label}
					</text>
				{/if}
			{/each}
		{/if}

		<!-- Axes -->
		<line
			x1={padding.left}
			y1={padding.top}
			x2={padding.left}
			y2={padding.top + chartHeight}
			class="stroke-gray-300 dark:stroke-gray-600"
		/>
		<line
			x1={padding.left}
			y1={padding.top + chartHeight}
			x2={padding.left + chartWidth}
			y2={padding.top + chartHeight}
			class="stroke-gray-300 dark:stroke-gray-600"
		/>
	</svg>
</div>
