<script lang="ts">
	import { Card } from '$lib/components/ui';
	import ProfileForm from './ProfileForm.svelte';
	import type { ProfileFormData } from '../types';

	interface Props {
		formData: ProfileFormData;
		errors?: Record<string, string>;
		onUpdate: (data: Partial<ProfileFormData>) => void;
	}

	let { formData, errors = {}, onUpdate }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">基本資料</h2>
	{/snippet}
	{#snippet children()}
		<ProfileForm {formData} {errors} {onUpdate} />
	{/snippet}
</Card>
