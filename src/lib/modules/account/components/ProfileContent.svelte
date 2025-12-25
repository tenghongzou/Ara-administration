<script lang="ts">
	import type { User } from '$lib/types';
	import type { ProfileFormData } from '../types';
	import ProfileAvatarCard from './ProfileAvatarCard.svelte';
	import AccountInfoCard from './AccountInfoCard.svelte';
	import ProfileFormCard from './ProfileFormCard.svelte';
	import BioSection from './BioSection.svelte';
	import ProfileActions from './ProfileActions.svelte';

	interface Props {
		user: User | null;
		formData: ProfileFormData;
		errors: Record<string, string>;
		saving?: boolean;
		uploadingAvatar?: boolean;
		onFormUpdate: (data: Partial<ProfileFormData>) => void;
		onBioUpdate: (value: string) => void;
		onAvatarUpload: (file: File) => void;
		onAvatarRemove: () => void;
		onSubmit: () => void;
		onCancel: () => void;
	}

	let {
		user,
		formData,
		errors,
		saving = false,
		uploadingAvatar = false,
		onFormUpdate,
		onBioUpdate,
		onAvatarUpload,
		onAvatarRemove,
		onSubmit,
		onCancel
	}: Props = $props();

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		onSubmit();
	}
</script>

<div class="max-w-3xl mx-auto">
	{#if !user}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400">載入中...</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-6">
			<ProfileAvatarCard
				avatar={formData.avatar || ''}
				name={formData.name}
				uploading={uploadingAvatar}
				onUpload={onAvatarUpload}
				onRemove={onAvatarRemove}
			/>

			<AccountInfoCard username={user.username} role={user.role} />

			<ProfileFormCard {formData} {errors} onUpdate={onFormUpdate} />

			<BioSection value={formData.bio || ''} error={errors.bio} onUpdate={onBioUpdate} />

			<ProfileActions {saving} onCancel={onCancel} />
		</form>
	{/if}
</div>
