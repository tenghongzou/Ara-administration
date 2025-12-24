<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { profileService } from '../services/profile.service';

	interface Props {
		avatar: string;
		name: string;
		uploading?: boolean;
		onUpload: (file: File) => Promise<void>;
		onRemove: () => Promise<void>;
	}

	let { avatar, name, uploading = false, onUpload, onRemove }: Props = $props();

	let fileInput: HTMLInputElement;
	const initials = $derived(profileService.getInitials(name));

	function triggerUpload() {
		fileInput?.click();
	}

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			await onUpload(file);
			target.value = '';
		}
	}
</script>

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="hidden"
	onchange={handleFileChange}
/>

<div class="flex items-center gap-6">
	<div class="relative">
		<div
			class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden"
		>
			{#if avatar}
				<img src={avatar} alt="頭像" class="w-full h-full object-cover" />
			{:else}
				<span class="text-2xl font-medium text-gray-500 dark:text-gray-400">
					{initials}
				</span>
			{/if}
		</div>
		{#if uploading}
			<div class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
				<svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			</div>
		{/if}
	</div>
	<div class="flex-1">
		<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
			建議使用正方形圖片，最大檔案大小為 5MB
		</p>
		<div class="flex gap-3">
			<Button variant="outline" onclick={triggerUpload} disabled={uploading}>
				{#snippet children()}
					{#if uploading}
						上傳中...
					{:else}
						上傳新頭像
					{/if}
				{/snippet}
			</Button>
			{#if avatar}
				<Button variant="ghost" onclick={onRemove} disabled={uploading}>
					{#snippet children()}移除{/snippet}
				</Button>
			{/if}
		</div>
	</div>
</div>
