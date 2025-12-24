<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { toast } from '$lib/stores/toast';
	import { auth, currentUser } from '$lib/stores/auth';
	import { authApi } from '$lib/services';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Input, Card } from '$lib/components/ui';
	import { DatePicker } from '$lib/components/forms';

	// 從 auth store 取得當前使用者
	let user = $derived($currentUser);

	// 表單狀態 - 初始化時從使用者資料載入
	let formData = $state({
		name: '',
		email: '',
		phone: '',
		birthday: '',
		bio: '',
		avatar: ''
	});

	// 監聽 user 變化並更新表單
	$effect(() => {
		if (user) {
			formData = {
				name: user.name || '',
				email: user.email || '',
				phone: user.phone || '',
				birthday: user.birthday || '',
				bio: user.bio || '',
				avatar: user.avatar || ''
			};
		}
	});

	let saving = $state(false);
	let uploadingAvatar = $state(false);
	let errors = $state<Record<string, string>>({});

	// 用於檔案上傳的 input ref
	let fileInput: HTMLInputElement;

	function validateForm(): boolean {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = '請輸入名稱';
		}
		if (!formData.email.trim()) {
			newErrors.email = '請輸入電子郵件';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = '請輸入有效的電子郵件地址';
		}
		if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
			newErrors.phone = '請輸入有效的電話號碼';
		}
		if (formData.bio && formData.bio.length > 500) {
			newErrors.bio = '自我介紹不能超過 500 字元';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm() || !user) return;

		saving = true;
		try {
			const updatedUser = await authApi.updateProfile(user.id, {
				name: formData.name,
				email: formData.email,
				phone: formData.phone || undefined,
				birthday: formData.birthday || undefined,
				bio: formData.bio || undefined
			});

			// 更新 auth store
			auth.updateUser(updatedUser);
			toast.success('個人資料已更新');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '更新失敗，請稍後再試');
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto('/settings');
	}

	function triggerFileUpload() {
		fileInput?.click();
	}

	async function handleAvatarUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file || !user) return;

		// 驗證檔案類型
		if (!file.type.startsWith('image/')) {
			toast.error('請選擇圖片檔案');
			return;
		}

		// 驗證檔案大小 (5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('檔案大小不能超過 5MB');
			return;
		}

		uploadingAvatar = true;
		try {
			const avatarUrl = await authApi.uploadAvatar(user.id, file);
			formData.avatar = avatarUrl;
			auth.updateUser({ avatar: avatarUrl });
			toast.success('頭像已更新');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '頭像上傳失敗');
		} finally {
			uploadingAvatar = false;
			// 清空 input 以便重複選擇同一檔案
			target.value = '';
		}
	}

	async function handleRemoveAvatar() {
		if (!user) return;

		try {
			await authApi.updateProfile(user.id, { avatar: '' });
			formData.avatar = '';
			auth.updateUser({ avatar: undefined });
			toast.success('頭像已移除');
		} catch (error) {
			toast.error('移除頭像失敗');
		}
	}

	// 取得使用者頭像顯示名稱的首字母
	let initials = $derived(
		formData.name
			? formData.name
					.split(' ')
					.map((n) => n[0])
					.join('')
					.toUpperCase()
					.slice(0, 2)
			: 'U'
	);
</script>

<svelte:head>
	<title>個人資料 - {config.appName}</title>
</svelte:head>

<!-- 隱藏的檔案上傳 input -->
<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="hidden"
	onchange={handleAvatarUpload}
/>

<PageContainer
	title="個人資料"
	description="管理您的個人資料和偏好設定"
	backLink="/settings"
	backLabel="返回設定"
>
	<div class="max-w-3xl mx-auto">
		{#if !user}
			<div class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">載入中...</p>
			</div>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
				<!-- 頭像區域 -->
				<Card variant="bordered">
					{#snippet header()}
						<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">頭像</h2>
					{/snippet}
					{#snippet children()}
						<div class="flex items-center gap-6">
							<div class="relative">
								<div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
									{#if formData.avatar}
										<img src={formData.avatar} alt="頭像" class="w-full h-full object-cover" />
									{:else}
										<span class="text-2xl font-medium text-gray-500 dark:text-gray-400">
											{initials}
										</span>
									{/if}
								</div>
								{#if uploadingAvatar}
									<div class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
										<svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
									</div>
								{/if}
							</div>
							<div class="flex-1">
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
									建議使用正方形圖片，最大檔案大小為 5MB
								</p>
								<div class="flex gap-3">
									<Button variant="outline" onclick={triggerFileUpload} disabled={uploadingAvatar}>
										{#snippet children()}
											{#if uploadingAvatar}
												上傳中...
											{:else}
												上傳新頭像
											{/if}
										{/snippet}
									</Button>
									{#if formData.avatar}
										<Button variant="ghost" onclick={handleRemoveAvatar} disabled={uploadingAvatar}>
											{#snippet children()}移除{/snippet}
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{/snippet}
				</Card>

				<!-- 帳號資訊 -->
				<Card variant="bordered">
					{#snippet header()}
						<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">帳號資訊</h2>
					{/snippet}
					{#snippet children()}
						<div class="space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
										使用者名稱
									</span>
									<div class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400">
										{user.username}
									</div>
									<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
										使用者名稱無法修改
									</p>
								</div>
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
										角色
									</span>
									<div class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400">
										{user.role}
									</div>
									<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
										角色由管理員指派
									</p>
								</div>
							</div>
						</div>
					{/snippet}
				</Card>

				<!-- 基本資料 -->
				<Card variant="bordered">
					{#snippet header()}
						<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">基本資料</h2>
					{/snippet}
					{#snippet children()}
						<div class="space-y-4">
							<Input
								bind:value={formData.name}
								label="顯示名稱"
								placeholder="請輸入顯示名稱"
								error={errors.name}
								required
							/>
							<Input
								bind:value={formData.email}
								type="email"
								label="電子郵件"
								placeholder="請輸入電子郵件"
								error={errors.email}
								required
							/>
							<Input
								bind:value={formData.phone}
								type="tel"
								label="電話號碼"
								placeholder="請輸入電話號碼"
								error={errors.phone}
							/>
							<DatePicker
								bind:value={formData.birthday}
								label="生日"
								placeholder="選擇生日"
								max={new Date().toISOString().split('T')[0]}
							/>
						</div>
					{/snippet}
				</Card>

				<!-- 個人簡介 -->
				<Card variant="bordered">
					{#snippet header()}
						<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">個人簡介</h2>
					{/snippet}
					{#snippet children()}
						<div class="space-y-1.5">
							<label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
								自我介紹
							</label>
							<textarea
								id="bio"
								bind:value={formData.bio}
								rows={4}
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] resize-none"
								placeholder="介紹一下自己..."
							></textarea>
							<div class="flex justify-between">
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{#if errors.bio}
										<span class="text-red-500">{errors.bio}</span>
									{:else}
										最多 500 字元
									{/if}
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{formData.bio.length}/500
								</p>
							</div>
						</div>
					{/snippet}
				</Card>

				<!-- 操作按鈕 -->
				<div class="flex justify-end gap-3">
					<Button type="button" variant="outline" onclick={handleCancel}>
						{#snippet children()}取消{/snippet}
					</Button>
					<Button type="submit" loading={saving}>
						{#snippet children()}儲存變更{/snippet}
					</Button>
				</div>
			</form>
		{/if}
	</div>
</PageContainer>
