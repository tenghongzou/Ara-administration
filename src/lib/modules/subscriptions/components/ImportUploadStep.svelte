<script lang="ts">
	import { Card, Button, Spinner } from '$lib/components/ui';
	import { Upload, FileSpreadsheet, Download } from 'lucide-svelte';

	interface Props {
		parsing?: boolean;
		onFileSelect: (file: File) => void;
		onDownloadTemplate: () => void;
	}

	let { parsing = false, onFileSelect, onDownloadTemplate }: Props = $props();

	let isDragging = $state(false);

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			onFileSelect(file);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (file) {
			onFileSelect(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- 上傳區域 -->
	<Card variant="bordered" class="p-8">
		<div
			class={[
				'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
				isDragging
					? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/10'
					: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
			].join(' ')}
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			role="button"
			tabindex="0"
		>
			{#if parsing}
				<div class="flex flex-col items-center gap-4">
					<Spinner size="lg" />
					<p class="text-gray-600 dark:text-gray-400">正在解析檔案...</p>
				</div>
			{:else}
				<div class="flex flex-col items-center gap-4">
					<div
						class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
					>
						<Upload class="w-8 h-8 text-gray-400" />
					</div>
					<div>
						<p class="text-lg font-medium text-gray-900 dark:text-gray-100">
							拖放檔案到這裡，或點擊選擇檔案
						</p>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
							支援 CSV、Excel (.xlsx, .xls) 格式
						</p>
					</div>
					<label>
						<input
							type="file"
							accept=".csv,.xlsx,.xls"
							onchange={handleFileInput}
							class="hidden"
						/>
						<span
							class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] cursor-pointer transition-colors"
						>
							<FileSpreadsheet class="w-4 h-4" />
							選擇檔案
						</span>
					</label>
				</div>
			{/if}
		</div>
	</Card>

	<!-- 下載範本 -->
	<Card variant="bordered" class="p-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="font-medium text-gray-900 dark:text-gray-100">下載匯入範本</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
					使用範本檔案可確保資料格式正確
				</p>
			</div>
			<Button variant="outline" onclick={onDownloadTemplate}>
				<Download class="w-4 h-4 mr-2" />
				下載範本
			</Button>
		</div>
	</Card>

	<!-- 欄位說明 -->
	<Card variant="bordered" class="p-4">
		<h3 class="font-medium text-gray-900 dark:text-gray-100 mb-3">欄位說明</h3>
		<div class="grid gap-2 text-sm">
			<div class="flex">
				<span class="w-32 font-medium text-gray-700 dark:text-gray-300">name *</span>
				<span class="text-gray-600 dark:text-gray-400">訂閱服務名稱</span>
			</div>
			<div class="flex">
				<span class="w-32 font-medium text-gray-700 dark:text-gray-300">cost *</span>
				<span class="text-gray-600 dark:text-gray-400">費用金額 (數字)</span>
			</div>
			<div class="flex">
				<span class="w-32 font-medium text-gray-700 dark:text-gray-300">nextBillingDate *</span>
				<span class="text-gray-600 dark:text-gray-400">下次扣款日 (YYYY-MM-DD)</span>
			</div>
			<div class="flex">
				<span class="w-32 font-medium text-gray-700 dark:text-gray-300">category</span>
				<span class="text-gray-600 dark:text-gray-400"
					>分類 (streaming/music/cloud/productivity/gaming/other)</span
				>
			</div>
			<div class="flex">
				<span class="w-32 font-medium text-gray-700 dark:text-gray-300">billingCycle</span>
				<span class="text-gray-600 dark:text-gray-400"
					>週期 (weekly/monthly/quarterly/semi-annual/annual)</span
				>
			</div>
		</div>
	</Card>
</div>
