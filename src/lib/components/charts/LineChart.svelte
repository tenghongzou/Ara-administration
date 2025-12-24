<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Title,
		Tooltip,
		Legend,
		Filler,
		type ChartData,
		type ChartOptions
	} from 'chart.js';

	// Register Chart.js components
	Chart.register(
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Title,
		Tooltip,
		Legend,
		Filler
	);

	interface Props {
		data: ChartData<'line'>;
		options?: ChartOptions<'line'>;
		class?: string;
	}

	let { data, options = {}, class: className = '' }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'line'> | null = null;

	const defaultOptions: ChartOptions<'line'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: 'top'
			}
		},
		scales: {
			y: {
				beginAtZero: true
			}
		}
	};

	function createChart() {
		if (!browser || !canvas) return;

		if (chart) {
			chart.destroy();
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'line',
			data,
			options: { ...defaultOptions, ...options }
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
