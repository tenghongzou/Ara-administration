<script lang="ts">
	import { CheckCircle } from 'lucide-svelte';

	export type ImportStep = 'upload' | 'mapping' | 'preview' | 'complete';

	interface Props {
		currentStep: ImportStep;
	}

	let { currentStep }: Props = $props();

	const steps = [
		{ id: 'upload', label: '上傳檔案' },
		{ id: 'mapping', label: '欄位對應' },
		{ id: 'preview', label: '預覽確認' },
		{ id: 'complete', label: '完成' }
	] as const;

	const stepOrder: ImportStep[] = ['upload', 'mapping', 'preview', 'complete'];
</script>

<div class="mb-8">
	<div class="flex items-center justify-center">
		{#each steps as step, i}
			{@const stepIndex = stepOrder.indexOf(currentStep)}
			{@const isActive = step.id === currentStep}
			{@const isCompleted = i < stepIndex}
			<div class="flex items-center">
				<div
					class={[
						'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
						isActive
							? 'bg-[var(--color-primary-600)] text-white'
							: isCompleted
								? 'bg-green-500 text-white'
								: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
					].join(' ')}
				>
					{#if isCompleted}
						<CheckCircle class="w-5 h-5" />
					{:else}
						{i + 1}
					{/if}
				</div>
				<span
					class={[
						'ml-2 text-sm',
						isActive
							? 'font-medium text-gray-900 dark:text-gray-100'
							: 'text-gray-500 dark:text-gray-400'
					].join(' ')}
				>
					{step.label}
				</span>
				{#if i < 3}
					<div class="w-12 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
