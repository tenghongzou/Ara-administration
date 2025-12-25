<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { FieldMapping } from '$lib/components/subscriptions';
	import { ArrowRight, ArrowLeft } from 'lucide-svelte';
	import type { FieldMapping as FieldMappingType } from '$lib/utils/csv-parser';

	interface Props {
		headers: string[];
		mapping: FieldMappingType;
		requiredFieldsMapped: boolean;
		onMappingChange: (mapping: FieldMappingType) => void;
		onBack: () => void;
		onNext: () => void;
	}

	let {
		headers,
		mapping,
		requiredFieldsMapped,
		onMappingChange,
		onBack,
		onNext
	}: Props = $props();
</script>

<div class="space-y-6">
	<FieldMapping {headers} {mapping} onMappingChange={onMappingChange} />

	<div class="flex items-center justify-between">
		<Button variant="outline" onclick={onBack}>
			<ArrowLeft class="w-4 h-4 mr-2" />
			上一步
		</Button>
		<Button onclick={onNext} disabled={!requiredFieldsMapped}>
			下一步
			<ArrowRight class="w-4 h-4 ml-2" />
		</Button>
	</div>
</div>
