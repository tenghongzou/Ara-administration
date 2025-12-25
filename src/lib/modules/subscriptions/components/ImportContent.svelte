<script lang="ts">
	import type { FieldMapping, MappedSubscription } from '$lib/utils/csv-parser';
	import type { ImportStep, ImportResult } from '../types';
	import ImportStepIndicator from './ImportStepIndicator.svelte';
	import ImportUploadStep from './ImportUploadStep.svelte';
	import ImportMappingStep from './ImportMappingStep.svelte';
	import ImportPreviewStep from './ImportPreviewStep.svelte';
	import ImportCompleteStep from './ImportCompleteStep.svelte';

	interface Props {
		currentStep: ImportStep;
		parsing?: boolean;
		importing?: boolean;
		headers: string[];
		fieldMapping: FieldMapping;
		requiredFieldsMapped: boolean;
		mappedSubscriptions: MappedSubscription[];
		duplicateRows: Set<number>;
		selectedRows: Set<number>;
		importResult: ImportResult | null;
		onFileSelect: (file: File) => void;
		onDownloadTemplate: () => void;
		onMappingChange: (mapping: FieldMapping) => void;
		onSelectionChange: (selected: Set<number>) => void;
		onBack: () => void;
		onProceedToPreview: () => void;
		onImport: () => void;
		onImportAgain: () => void;
	}

	let {
		currentStep,
		parsing = false,
		importing = false,
		headers,
		fieldMapping,
		requiredFieldsMapped,
		mappedSubscriptions,
		duplicateRows,
		selectedRows,
		importResult,
		onFileSelect,
		onDownloadTemplate,
		onMappingChange,
		onSelectionChange,
		onBack,
		onProceedToPreview,
		onImport,
		onImportAgain
	}: Props = $props();
</script>

<ImportStepIndicator {currentStep} />

{#if currentStep === 'upload'}
	<ImportUploadStep {parsing} onFileSelect={onFileSelect} onDownloadTemplate={onDownloadTemplate} />
{:else if currentStep === 'mapping'}
	<ImportMappingStep
		{headers}
		mapping={fieldMapping}
		{requiredFieldsMapped}
		onMappingChange={onMappingChange}
		onBack={onBack}
		onNext={onProceedToPreview}
	/>
{:else if currentStep === 'preview'}
	<ImportPreviewStep
		subscriptions={mappedSubscriptions}
		{duplicateRows}
		{selectedRows}
		{importing}
		onSelectionChange={onSelectionChange}
		onBack={onBack}
		onImport={onImport}
	/>
{:else if currentStep === 'complete'}
	<ImportCompleteStep result={importResult} onImportAgain={onImportAgain} />
{/if}
