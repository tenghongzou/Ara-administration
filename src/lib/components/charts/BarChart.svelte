<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import {
		Chart,
		BarController,
		BarElement,
		LinearScale,
		CategoryScale,
		Title,
		Tooltip,
		Legend,
		type ChartData,
		type ChartOptions
	} from 'chart.js';

	// Register Chart.js components
	Chart.register(BarController, BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

	interface Props {
		data: ChartData<'bar'>;
		options?: ChartOptions<'bar'>;
		class?: string;
		horizontal?: boolean;
	}

	let { data, options = {}, class: className = '', horizontal = false }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'bar'> | null = null;

	const defaultOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: horizontal ? 'y' : 'x',
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
			type: 'bar',
			data,
			options: { ...defaultOptions, ...options, indexAxis: horizontal ? 'y' : 'x' }
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
