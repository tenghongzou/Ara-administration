<script lang="ts">
	import { Modal, Button, Checkbox } from '$lib/components/ui';
	import type { ExportFormat, ExportOptions } from '../types';
	import { exportFields, formatOptions, logsExportService } from '../services/logs-export';
	import type { AuditLog } from '$lib/services/mock-data';
	import { toast } from '$lib/stores/toast';

	interface Props {
		logs: AuditLog[];
		open: boolean;
		onClose?: () => void;
	}

	let { logs, open = $bindable(false), onClose }: Props = $props();

	let selectedFormat = $state<ExportFormat>('csv');
	let selectedFields = $state<Set<string>>(new Set(logsExportService.getDefaultFields()));

	function toggleField(field: string) {
		const newSet = new Set(selectedFields);
		if (newSet.has(field)) {
			newSet.delete(field);
		} else {
			newSet.add(field);
		}
		selectedFields = newSet;
	}

	function selectAllFields() {
		selectedFields = new Set(exportFields.map((f) => f.key));
	}

	function selectDefaultFields() {
		selectedFields = new Set(logsExportService.getDefaultFields());
	}

	function handleExport() {
		if (selectedFields.size === 0) {
			toast.error('請至少選擇一個欄位');
			return;
		}

		try {
			const options: ExportOptions = {
				format: selectedFormat,
				includeFields: Array.from(selectedFields)
			};

			logsExportService.download(logs, options);
			toast.success(`已匯出 ${logs.length} 筆日誌`);
			open = false;
			onClose?.();
		} catch (error) {
			toast.error('匯出失敗');
			console.error('Export error:', error);
		}
	}
</script>

<Modal bind:open title="匯出日誌" size="lg" {onClose}>
	{#snippet children()}
		<div class="space-y-6">
			<!-- 格式選擇 -->
			<div>
				<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					匯出格式
				</span>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{#each formatOptions as format}
						<button
							type="button"
							class="p-4 rounded-lg border-2 text-left transition-colors {selectedFormat ===
							format.value
								? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
								: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
							onclick={() => (selectedFormat = format.value)}
						>
							<p class="font-medium text-gray-900 dark:text-gray-100">{format.label}</p>
							<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{format.description}</p>
						</button>
					{/each}
				</div>
			</div>

			<!-- 欄位選擇 -->
			<div>
				<div class="flex items-center justify-between mb-3">
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						匯出欄位
					</span>
					<div class="flex gap-2">
						<button
							type="button"
							class="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
							onclick={selectAllFields}
						>
							全選
						</button>
						<span class="text-gray-300 dark:text-gray-600">|</span>
						<button
							type="button"
							class="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
							onclick={selectDefaultFields}
						>
							預設
						</button>
					</div>
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{#each exportFields as field}
						<label
							class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
						>
							<Checkbox
								checked={selectedFields.has(field.key)}
								onchange={() => toggleField(field.key)}
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- 匯出資訊 -->
			<div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
				<p class="text-sm text-gray-600 dark:text-gray-400">
					將匯出 <span class="font-semibold text-gray-900 dark:text-gray-100">{logs.length}</span> 筆日誌，包含
					<span class="font-semibold text-gray-900 dark:text-gray-100">{selectedFields.size}</span> 個欄位
				</p>
			</div>
		</div>
	{/snippet}

	{#snippet footer()}
		<Button variant="outline" onclick={() => (open = false)}>
			{#snippet children()}取消{/snippet}
		</Button>
		<Button variant="primary" onclick={handleExport} disabled={selectedFields.size === 0}>
			{#snippet children()}匯出{/snippet}
		</Button>
	{/snippet}
</Modal>
