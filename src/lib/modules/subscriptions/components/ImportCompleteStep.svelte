<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card, Button } from '$lib/components/ui';
	import { CheckCircle, XCircle } from 'lucide-svelte';
	import type { ImportResult } from '../types';

	interface Props {
		result: ImportResult | null;
		onImportAgain: () => void;
	}

	let { result, onImportAgain }: Props = $props();

	let isSuccess = $derived(result && result.success > 0);
</script>

<div class="max-w-md mx-auto">
	<Card variant="bordered" class="p-8 text-center">
		{#if isSuccess}
			<div
				class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4"
			>
				<CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
			</div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">匯入完成</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				成功匯入 {result?.success} 筆訂閱
				{#if result && result.failed > 0}
					，{result.failed} 筆失敗
				{/if}
			</p>
		{:else}
			<div
				class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"
			>
				<XCircle class="w-8 h-8 text-red-600 dark:text-red-400" />
			</div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">匯入失敗</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-6">未能成功匯入任何資料</p>
		{/if}

		<div class="flex justify-center gap-3">
			<Button variant="outline" onclick={() => goto('/subscriptions')}>
				返回列表
			</Button>
			<Button onclick={onImportAgain}>
				再次匯入
			</Button>
		</div>
	</Card>
</div>
