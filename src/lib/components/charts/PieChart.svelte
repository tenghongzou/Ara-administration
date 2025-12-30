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
	let containerEl: HTMLDivElement;

	// 響應式判斷是否為小螢幕
	let isSmallScreen = $state(false);

	function checkScreenSize() {
		if (browser) {
			isSmallScreen = window.innerWidth < 640;
		}
	}

	let defaultOptions = $derived<ChartOptions<'doughnut'>>({
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: isSmallScreen ? 'bottom' : 'right',
				labels: {
					boxWidth: isSmallScreen ? 12 : 40,
					padding: isSmallScreen ? 8 : 10,
					font: {
						size: isSmallScreen ? 11 : 12
					}
				}
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
	});

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

	function handleResize() {
		const wasSmall = isSmallScreen;
		checkScreenSize();
		// 如果螢幕大小類別改變，重建圖表
		if (wasSmall !== isSmallScreen && chart) {
			createChart();
		}
	}

	onMount(() => {
		checkScreenSize();
		createChart();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
		if (browser) {
			window.removeEventListener('resize', handleResize);
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

<div class={className} bind:this={containerEl}>
	<canvas bind:this={canvas}></canvas>
</div>
