<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { auth, currentUser } from '$lib/stores/auth';
	import { PageContainer } from '$lib/components/layout';
	import {
		profileService,
		ProfileContent,
		type ProfileFormData
	} from '$lib/modules/account';

	// 從 auth store 取得當前使用者
	let user = $derived($currentUser);

	// 表單狀態
	let formData = $state<ProfileFormData>({
		name: '',
		email: '',
		phone: '',
		birthday: '',
		bio: '',
		avatar: ''
	});

	let saving = $state(false);
	let uploadingAvatar = $state(false);
	let errors = $state<Record<string, string>>({});

	// 監聽 user 變化並更新表單
	$effect(() => {
		if (user) {
			formData = profileService.createFormData(user);
		}
	});

	function handleFormUpdate(data: Partial<ProfileFormData>) {
		formData = { ...formData, ...data };
	}

	function handleBioUpdate(value: string) {
		formData = { ...formData, bio: value };
	}

	async function handleSubmit() {
		if (!user) return;

		const validationErrors = profileService.validateForm(formData);
		if (Object.keys(validationErrors).length > 0) {
			errors = validationErrors;
			return;
		}

		errors = {};
		saving = true;
		try {
			const updatedUser = await profileService.updateProfile(user.id, formData);
			auth.updateUser(updatedUser);
			toast.success('個人資料已更新');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '更新失敗，請稍後再試');
		} finally {
			saving = false;
		}
	}

	async function handleAvatarUpload(file: File) {
		if (!user) return;

		uploadingAvatar = true;
		try {
			const avatarUrl = await profileService.uploadAvatar(user.id, file);
			formData = { ...formData, avatar: avatarUrl };
			auth.updateUser({ avatar: avatarUrl });
			toast.success('頭像已更新');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '頭像上傳失敗');
		} finally {
			uploadingAvatar = false;
		}
	}

	async function handleAvatarRemove() {
		if (!user) return;

		try {
			await profileService.removeAvatar(user.id);
			formData = { ...formData, avatar: '' };
			auth.updateUser({ avatar: undefined });
			toast.success('頭像已移除');
		} catch (error) {
			toast.error('移除頭像失敗');
		}
	}
</script>

<svelte:head>
	<title>個人資料 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="個人資料"
	description="管理您的個人資料和偏好設定"
	backLink="/settings"
	backLabel="返回設定"
>
	<ProfileContent
		{user}
		{formData}
		{errors}
		{saving}
		uploadingAvatar={uploadingAvatar}
		onFormUpdate={handleFormUpdate}
		onBioUpdate={handleBioUpdate}
		onAvatarUpload={handleAvatarUpload}
		onAvatarRemove={handleAvatarRemove}
		onSubmit={handleSubmit}
		onCancel={() => goto('/settings')}
	/>
</PageContainer>
