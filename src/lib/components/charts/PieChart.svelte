<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {
		Chart,
		DoughnutController,
		ArcElement,
		Title,
		Tooltip,
		Legend,
		type ChartData,
		type ChartOptions
	} from 'chart.js';

	// Register Chart.js components
	Chart.register(DoughnutController, ArcElement, Title, Tooltip, Legend);

	interface Props {
		data: ChartData<'doughnut'>;
		options?: ChartOptions<'doughnut'>;
		class?: string;
		doughnut?: boolean;
	}

	let { data, options = {}, class: className = '', doughnut = true }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'doughnut'> | null = null;

	const defaultOptions: ChartOptions<'doughnut'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: 'right'
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						const label = context.label || '';
						const value = context.parsed || 0;
						const total = context.dataset.data.reduce(
							(a: number, b: number) => a + (b as number),
							0
						);
						const percentage = ((value / total) * 100).toFixed(1);
						return `${label}: ${value.toLocaleString()} (${percentage}%)`;
					}
				}
			}
		},
		cutout: doughnut ? '60%' : 0
	};

	function createChart() {
		if (!browser || !canvas) return;

		if (chart) {
			chart.destroy();
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'doughnut',
			data,
			options: { ...defaultOptions, ...options, cutout: doughnut ? '60%' : 0 }
		});
	}

	onMount(() => {
		createChart();
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

	// Update chart when data changes
	$effect(() => {
		if (chart && data) {
			chart.data = data;
			chart.update();
		}
	});
</script>

<div class={className}>
	<canvas bind:this={canvas}></canvas>
</div>
