<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { subscriptionsApi, type ImportResult } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Card, Button, Spinner } from '$lib/components/ui';
	import { FieldMapping, ImportPreview } from '$lib/components/subscriptions';
	import {
		parseCSV,
		autoDetectMapping,
		mapAndValidateData,
		findDuplicates,
		type FieldMapping as FieldMappingType,
		type ParsedRow,
		type MappedSubscription
	} from '$lib/utils/csv-parser';
	import { parseExcel, getFileType } from '$lib/utils/excel-parser';
	import {
		Upload,
		FileSpreadsheet,
		ArrowRight,
		ArrowLeft,
		CheckCircle,
		XCircle,
		Download
	} from 'lucide-svelte';

	// 步驟狀態
	type Step = 'upload' | 'mapping' | 'preview' | 'complete';
	let currentStep = $state<Step>('upload');

	// 檔案和資料狀態
	let selectedFile = $state<File | null>(null);
	let rawData = $state<ParsedRow[]>([]);
	let headers = $state<string[]>([]);
	let fieldMapping = $state<FieldMappingType>({
		name: null,
		category: null,
		cost: null,
		currency: null,
		billingCycle: null,
		nextBillingDate: null,
		status: null,
		description: null,
		website: null,
		accountEmail: null,
		paymentMethod: null,
		autoRenew: null,
		reminderDays: null
	});
	let mappedSubscriptions = $state<MappedSubscription[]>([]);
	let duplicateRows = $state<Set<number>>(new Set());
	let selectedRows = $state<Set<number>>(new Set());
	let existingNames = $state<string[]>([]);

	// 載入狀態
	let parsing = $state(false);
	let importing = $state(false);
	let importResult = $state<ImportResult | null>(null);

	// 拖放狀態
	let isDragging = $state(false);

	async function handleFileSelect(file: File) {
		const fileType = getFileType(file);
		if (fileType === 'unknown') {
			toast.error('不支援的檔案格式，請上傳 CSV 或 Excel 檔案');
			return;
		}

		selectedFile = file;
		parsing = true;

		try {
			const result = fileType === 'csv' ? await parseCSV(file) : await parseExcel(file);

			rawData = result.data;
			headers = result.headers;

			if (result.errors.length > 0) {
				toast.warning(`檔案解析有 ${result.errors.length} 個警告`);
			}

			// 自動偵測欄位對應
			fieldMapping = autoDetectMapping(headers);

			// 載入現有訂閱名稱 (用於重複檢測)
			existingNames = await subscriptionsApi.getSubscriptionNames();

			currentStep = 'mapping';
			toast.success(`已載入 ${rawData.length} 筆資料`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '檔案解析失敗');
			selectedFile = null;
		} finally {
			parsing = false;
		}
	}

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (file) {
			handleFileSelect(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function proceedToPreview() {
		// 驗證必填欄位
		if (!fieldMapping.name || !fieldMapping.cost || !fieldMapping.nextBillingDate) {
			toast.error('請先對應所有必填欄位');
			return;
		}

		// 執行資料對應和驗證
		mappedSubscriptions = mapAndValidateData(rawData, fieldMapping);

		// 檢測重複
		duplicateRows = findDuplicates(mappedSubscriptions, existingNames);

		// 預設選中所有有效且非重複的項目
		const validRows = mappedSubscriptions
			.filter((s) => s.errors.length === 0)
			.map((s) => s.row);
		selectedRows = new Set(validRows);

		currentStep = 'preview';
	}

	function goBack() {
		if (currentStep === 'mapping') {
			currentStep = 'upload';
			selectedFile = null;
			rawData = [];
			headers = [];
		} else if (currentStep === 'preview') {
			currentStep = 'mapping';
		}
	}

	async function executeImport() {
		if (selectedRows.size === 0) {
			toast.error('請選擇要匯入的資料');
			return;
		}

		importing = true;

		try {
			const dataToImport = mappedSubscriptions
				.filter((s) => selectedRows.has(s.row))
				.map((s) => s.data);

			importResult = await subscriptionsApi.importSubscriptions(dataToImport);

			if (importResult.success > 0) {
				toast.success(`成功匯入 ${importResult.success} 筆訂閱`);
			}

			if (importResult.failed > 0) {
				toast.warning(`${importResult.failed} 筆匯入失敗`);
			}

			currentStep = 'complete';
		} catch (error) {
			toast.error('匯入失敗，請稍後再試');
		} finally {
			importing = false;
		}
	}

	function downloadTemplate() {
		const headers = [
			'name',
			'category',
			'cost',
			'currency',
			'billingCycle',
			'nextBillingDate',
			'description',
			'website',
			'accountEmail',
			'paymentMethod',
			'autoRenew',
			'reminderDays'
		];
		const example = [
			'Netflix',
			'streaming',
			'390',
			'TWD',
			'monthly',
			'2025-01-15',
			'影音串流服務',
			'https://netflix.com',
			'user@example.com',
			'credit_card',
			'true',
			'3'
		];

		const csv = [headers.join(','), example.join(',')].join('\n');
		const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'subscription_import_template.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	let requiredFieldsMapped = $derived(
		fieldMapping.name !== null &&
			fieldMapping.cost !== null &&
			fieldMapping.nextBillingDate !== null
	);
</script>

<svelte:head>
	<title>匯入訂閱 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="匯入訂閱"
	description="從 CSV 或 Excel 檔案批量匯入訂閱資料"
	backLink="/subscriptions"
	backLabel="返回訂閱列表"
>
	<!-- 步驟指示器 -->
	<div class="mb-8">
		<div class="flex items-center justify-center">
			{#each [
				{ id: 'upload', label: '上傳檔案' },
				{ id: 'mapping', label: '欄位對應' },
				{ id: 'preview', label: '預覽確認' },
				{ id: 'complete', label: '完成' }
			] as step, i}
				{@const stepIndex = ['upload', 'mapping', 'preview', 'complete'].indexOf(currentStep)}
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

	<!-- 步驟內容 -->
	{#if currentStep === 'upload'}
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
					<Button variant="outline" onclick={downloadTemplate}>
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
	{:else if currentStep === 'mapping'}
		<div class="space-y-6">
			<FieldMapping {headers} mapping={fieldMapping} onMappingChange={(m) => (fieldMapping = m)} />

			<div class="flex items-center justify-between">
				<Button variant="outline" onclick={goBack}>
					<ArrowLeft class="w-4 h-4 mr-2" />
					上一步
				</Button>
				<Button onclick={proceedToPreview} disabled={!requiredFieldsMapped}>
					下一步
					<ArrowRight class="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	{:else if currentStep === 'preview'}
		<div class="space-y-6">
			<ImportPreview
				subscriptions={mappedSubscriptions}
				{duplicateRows}
				{selectedRows}
				onSelectionChange={(s) => (selectedRows = s)}
			/>

			<div class="flex items-center justify-between">
				<Button variant="outline" onclick={goBack}>
					<ArrowLeft class="w-4 h-4 mr-2" />
					上一步
				</Button>
				<Button onclick={executeImport} disabled={selectedRows.size === 0 || importing}>
					{#if importing}
						<Spinner size="sm" class="mr-2" />
						匯入中...
					{:else}
						匯入 {selectedRows.size} 筆資料
					{/if}
				</Button>
			</div>
		</div>
	{:else if currentStep === 'complete'}
		<div class="max-w-md mx-auto">
			<Card variant="bordered" class="p-8 text-center">
				{#if importResult && importResult.success > 0}
					<div
						class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4"
					>
						<CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
					</div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">匯入完成</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						成功匯入 {importResult.success} 筆訂閱
						{#if importResult.failed > 0}
							，{importResult.failed} 筆失敗
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
					<Button
						onclick={() => {
							currentStep = 'upload';
							selectedFile = null;
							rawData = [];
							headers = [];
							importResult = null;
						}}
					>
						再次匯入
					</Button>
				</div>
			</Card>
		</div>
	{/if}
</PageContainer>
