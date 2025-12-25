<script lang="ts">
	import { config } from '$lib/constants';
	import { subscriptionsApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
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
	import { ImportContent, type ImportStep, type ImportResult } from '$lib/modules/subscriptions';

	// 步驟狀態
	let currentStep = $state<ImportStep>('upload');

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
		const templateHeaders = [
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

		const csv = [templateHeaders.join(','), example.join(',')].join('\n');
		const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'subscription_import_template.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImportAgain() {
		currentStep = 'upload';
		selectedFile = null;
		rawData = [];
		headers = [];
		importResult = null;
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
	<ImportContent
		{currentStep}
		{parsing}
		{importing}
		{headers}
		{fieldMapping}
		{requiredFieldsMapped}
		{mappedSubscriptions}
		{duplicateRows}
		{selectedRows}
		{importResult}
		onFileSelect={handleFileSelect}
		onDownloadTemplate={downloadTemplate}
		onMappingChange={(m) => (fieldMapping = m)}
		onSelectionChange={(s) => (selectedRows = s)}
		onBack={goBack}
		onProceedToPreview={proceedToPreview}
		onImport={executeImport}
		onImportAgain={handleImportAgain}
	/>
</PageContainer>
