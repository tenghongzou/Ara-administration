<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/services/core/api-client';
	import { notificationApi, type DispatchNotificationInput } from '$lib/services/notifications/api';
	import { toast } from '$lib/stores/toast';

	interface UserOption {
		id: string;
		name: string;
		email: string;
	}

	let target = $state<'broadcast' | 'users'>('broadcast');
	let type = $state<'info' | 'success' | 'warning' | 'error'>('info');
	let priority = $state<'Low' | 'Normal' | 'High' | 'Critical'>('Normal');
	let title = $state('');
	let message = $state('');
	let link = $state('');

	let users = $state<UserOption[]>([]);
	let usersLoading = $state(false);
	let userSearch = $state('');
	let selectedIds = $state<Set<string>>(new Set());
	let submitting = $state(false);

	const filteredUsers = $derived(
		userSearch.trim()
			? users.filter(
					(u) =>
						u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
						u.email.toLowerCase().includes(userSearch.toLowerCase())
				)
			: users
	);

	const canSubmit = $derived(
		title.trim() !== '' &&
			message.trim() !== '' &&
			!submitting &&
			(target === 'broadcast' || selectedIds.size > 0)
	);

	async function loadUsers() {
		if (users.length > 0 || usersLoading) return;
		usersLoading = true;
		try {
			const res = await apiClient.get<{ data: UserOption[] }>('/users?pageSize=100');
			users = res.data ?? [];
		} catch {
			toast.error('無法載入使用者清單');
		} finally {
			usersLoading = false;
		}
	}

	function toggleUser(id: string) {
		const next = new Set(selectedIds);
		next.has(id) ? next.delete(id) : next.add(id);
		selectedIds = next;
	}

	$effect(() => {
		if (target === 'users') loadUsers();
	});

	async function submit() {
		if (!canSubmit) return;
		submitting = true;
		try {
			const payload: DispatchNotificationInput = {
				target,
				type,
				priority,
				title: title.trim(),
				message: message.trim(),
				link: link.trim() || undefined,
				userIds: target === 'users' ? [...selectedIds] : undefined
			};
			await notificationApi.dispatch(payload);
			toast.success(
				target === 'broadcast' ? '已廣播通知給所有人' : `已發送通知給 ${selectedIds.size} 位使用者`
			);
			goto('/notifications');
		} catch {
			toast.error('發送失敗,請稍後再試');
		} finally {
			submitting = false;
		}
	}

	const typeOptions = [
		{ value: 'info', label: '資訊' },
		{ value: 'success', label: '成功' },
		{ value: 'warning', label: '警告' },
		{ value: 'error', label: '錯誤' }
	] as const;

	const priorityOptions = [
		{ value: 'Low', label: '低' },
		{ value: 'Normal', label: '一般' },
		{ value: 'High', label: '高' },
		{ value: 'Critical', label: '緊急' }
	] as const;

	const fieldClass =
		'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]';
</script>

<div class="max-w-2xl mx-auto p-4 lg:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">發送通知</h1>
		<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
			即時推送給線上使用者(WebSocket)。
		</p>
	</div>

	<div class="space-y-5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
		<!-- 對象 -->
		<div>
			<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">對象</span>
			<div class="flex gap-4">
				<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
					<input type="radio" value="broadcast" bind:group={target} /> 廣播給所有人
				</label>
				<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
					<input type="radio" value="users" bind:group={target} /> 指定使用者
				</label>
			</div>
		</div>

		<!-- 使用者選擇 -->
		{#if target === 'users'}
			<div>
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
						選擇使用者(已選 {selectedIds.size})
					</span>
				</div>
				<input class={fieldClass} placeholder="搜尋姓名或 email…" bind:value={userSearch} />
				<div class="mt-2 max-h-56 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
					{#if usersLoading}
						<div class="p-4 text-sm text-gray-500 text-center">載入中…</div>
					{:else if filteredUsers.length === 0}
						<div class="p-4 text-sm text-gray-500 text-center">沒有符合的使用者</div>
					{:else}
						{#each filteredUsers as u (u.id)}
							<label class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
								<input
									type="checkbox"
									checked={selectedIds.has(u.id)}
									onchange={() => toggleUser(u.id)}
								/>
								<span class="min-w-0">
									<span class="block text-sm text-gray-900 dark:text-gray-100 truncate">{u.name}</span>
									<span class="block text-xs text-gray-500 truncate">{u.email}</span>
								</span>
							</label>
						{/each}
					{/if}
				</div>
			</div>
		{/if}

		<!-- 類型 / 優先級 -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="notif-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">類型</label>
				<select id="notif-type" class={fieldClass} bind:value={type}>
					{#each typeOptions as o}<option value={o.value}>{o.label}</option>{/each}
				</select>
			</div>
			<div>
				<label for="notif-priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">優先級</label>
				<select id="notif-priority" class={fieldClass} bind:value={priority}>
					{#each priorityOptions as o}<option value={o.value}>{o.label}</option>{/each}
				</select>
			</div>
		</div>

		<!-- 標題 -->
		<div>
			<label for="notif-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">標題</label>
			<input id="notif-title" class={fieldClass} maxlength="120" bind:value={title} placeholder="通知標題" />
		</div>

		<!-- 內容 -->
		<div>
			<label for="notif-message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">內容</label>
			<textarea id="notif-message" class={fieldClass} rows="4" maxlength="500" bind:value={message} placeholder="通知內容"></textarea>
		</div>

		<!-- 連結 -->
		<div>
			<label for="notif-link" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">連結(選填)</label>
			<input id="notif-link" class={fieldClass} bind:value={link} placeholder="/subscriptions/…" />
		</div>

		<div class="flex justify-end gap-3 pt-2">
			<button
				type="button"
				class="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
				onclick={() => goto('/notifications')}
			>
				取消
			</button>
			<button
				type="button"
				class="px-4 py-2 text-sm rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-500)] disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={!canSubmit}
				onclick={submit}
			>
				{submitting ? '發送中…' : '發送'}
			</button>
		</div>
	</div>
</div>
