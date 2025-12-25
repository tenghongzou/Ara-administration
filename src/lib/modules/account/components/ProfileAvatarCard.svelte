<script lang="ts">
	import { Card } from '$lib/components/ui';
	import AvatarUpload from './AvatarUpload.svelte';

	interface Props {
		avatar: string;
		name: string;
		uploading?: boolean;
		onUpload: (file: File) => void;
		onRemove: () => void;
	}

	let { avatar, name, uploading = false, onUpload, onRemove }: Props = $props();
</script>

<Card variant="bordered">
	{#snippet header()}
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">頭像</h2>
	{/snippet}
	{#snippet children()}
		<AvatarUpload {avatar} {name} {uploading} {onUpload} {onRemove} />
	{/snippet}
</Card>
