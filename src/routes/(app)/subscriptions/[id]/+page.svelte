<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { config } from '$lib/constants';
	import {
		subscriptionsApi,
		billingCycleLabels,
		subscriptionStatusLabels,
		subscriptionStatusColors,
		categoryLabels,
		paymentMethodLabels
	} from '$lib/services';
	import type {
		Subscription,
		PaymentHistory,
		ServiceCategory,
		BillingCycle,
		PaymentMethod,
		SubscriptionStatus
	} from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Input, Select, Card, Checkbox, Badge, Spinner } from '$lib/components/ui';

	let subscription = $state<Subscription | null>(null);
	let paymentHistory = $state<PaymentHistory[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

	// Form fields
	let name = $state('');
	let category = $state<ServiceCategory>('streaming');
	let cost = $state<number | ''>('');
	let currency = $state('TWD');
	let billingCycle = $state<BillingCycle>('monthly');
	let nextBillingDate = $state('');
	let status = $state<SubscriptionStatus>('active');
	let description = $state('');
	let website = $state('');
	let accountEmail = $state('');
	let paymentMethod = $state<PaymentMethod | ''>('');
	let autoRenew = $state(true);
	let reminderDays = $state<number | ''>('');

	const categoryOptions = [
		{ value: 'streaming', label: '影音串流' },
		{ value: 'music', label: '音樂' },
		{ value: 'cloud', label: '雲端儲存' },
		{ value: 'productivity', label: '生產力工具' },
		{ value: 'gaming', label: '遊戲' },
		{ value: 'other', label: '其他' }
	];

	const cycleOptions = [
		{ value: 'weekly', label: '週繳' },
		{ value: 'monthly', label: '月繳' },
		{ value: 'quarterly', label: '季繳' },
		{ value: 'semi-annual', label: '半年繳' },
		{ value: 'annual', label: '年繳' }
	];

	const currencyOptions = [
		{ value: 'TWD', label: 'TWD (新台幣)' },
		{ value: 'USD', label: 'USD (美元)' },
		{ value: 'EUR', label: 'EUR (歐元)' },
		{ value: 'JPY', label: 'JPY (日圓)' }
	];

	const statusOptions = [
		{ value: 'active', label: '啟用中' },
		{ value: 'paused', label: '已暫停' },
		{ value: 'cancelled', label: '已取消' },
		{ value: 'expired', label: '已過期' }
	];

	const paymentMethodOptions = [
		{ value: '', label: '請選擇' },
		{ value: 'credit_card', label: '信用卡' },
		{ value: 'debit_card', label: '金融卡' },
		{ value: 'bank_transfer', label: '銀行轉帳' },
		{ value: 'paypal', label: 'PayPal' },
		{ value: 'other', label: '其他' }
	];

	async function loadSubscription() {
		const subscriptionId = $page.params.id;
		if (!subscriptionId) {
			goto('/subscriptions');
			return;
		}

		loading = true;
		try {
			const [sub, history] = await Promise.all([
				subscriptionsApi.getSubscription(subscriptionId),
				subscriptionsApi.getPaymentHistory(subscriptionId)
			]);
			subscription = sub;
			paymentHistory = history;

			// Populate form fields
			name = sub.name;
			category = sub.category;
			cost = sub.cost;
			currency = sub.currency;
			billingCycle = sub.billingCycle;
			nextBillingDate = sub.nextBillingDate;
			status = sub.status;
			description = sub.description || '';
			website = sub.website || '';
			accountEmail = sub.accountEmail || '';
			paymentMethod = sub.paymentMethod || '';
			autoRenew = sub.autoRenew;
			reminderDays = sub.reminderDays || '';
		} catch (error) {
			toast.error('載入訂閱失敗');
			goto('/subscriptions');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadSubscription();
	});

	function validate(): boolean {
		const newErrors: Record<string, string> = {};

		if (!name.trim()) {
			newErrors.name = '請輸入服務名稱';
		}

		if (cost === '' || cost <= 0) {
			newErrors.cost = '請輸入有效的費用金額';
		}

		if (!nextBillingDate) {
			newErrors.nextBillingDate = '請選擇下次扣款日';
		}

		if (accountEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) {
			newErrors.accountEmail = '請輸入有效的電子郵件格式';
		}

		if (website && !/^https?:\/\/.+/.test(website)) {
			newErrors.website = '請輸入有效的網址（需包含 http:// 或 https://）';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validate() || !subscription) return;

		saving = true;
		try {
			await subscriptionsApi.updateSubscription(subscription.id, {
				name: name.trim(),
				category,
				cost: Number(cost),
				currency,
				billingCycle,
				nextBillingDate,
				status,
				description: description.trim() || undefined,
				website: website.trim() || undefined,
				accountEmail: accountEmail.trim() || undefined,
				paymentMethod: paymentMethod || undefined,
				autoRenew,
				reminderDays: reminderDays ? Number(reminderDays) : undefined
			});
			toast.success('訂閱已更新');
			goto('/subscriptions');
		} catch (error) {
			toast.error('更新訂閱失敗');
		} finally {
			saving = false;
		}
	}

	function formatDate(dateString?: string): string {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	function formatCurrency(amount: number, curr: string = 'TWD'): string {
		return new Intl.NumberFormat('zh-TW', {
			style: 'currency',
			currency: curr,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<svelte:head>
	<title>{subscription?.name || '編輯訂閱'} - {config.appName}</title>
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center min-h-[400px]">
		<Spinner size="lg" />
	</div>
{:else if subscription}
	<PageContainer
		title="編輯訂閱"
		description={subscription.name}
		backLink="/subscriptions"
		backLabel="返回訂閱列表"
	>
		<div class="space-y-6">
			<!-- Subscription info -->
			<div>
				<Card>
					{#snippet children()}
						<div class="text-center">
							<div
								class="w-20 h-20 mx-auto rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300 mb-4"
							>
								{subscription!.name.charAt(0).toUpperCase()}
							</div>
							<h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
								{subscription!.name}
							</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
								{categoryLabels[subscription!.category]}
							</p>
							<div class="mt-3">
								<Badge variant={subscriptionStatusColors[subscription!.status]}>
									{#snippet children()}{subscriptionStatusLabels[subscription!.status]}{/snippet}
								</Badge>
							</div>
						</div>

						<div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
							<div class="flex justify-between">
								<span class="text-sm text-gray-500 dark:text-gray-400">費用</span>
								<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
									{formatCurrency(subscription!.cost, subscription!.currency)} / {billingCycleLabels[subscription!.billingCycle]}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-gray-500 dark:text-gray-400">下次扣款</span>
								<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
									{formatDate(subscription!.nextBillingDate)}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-gray-500 dark:text-gray-400">自動續訂</span>
								<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
									{subscription!.autoRenew ? '是' : '否'}
								</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-gray-500 dark:text-gray-400">建立時間</span>
								<span class="text-sm text-gray-600 dark:text-gray-400">
									{formatDate(subscription!.createdAt)}
								</span>
							</div>
							{#if subscription!.website}
								<div class="pt-2">
									<a
										href={subscription!.website}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-[var(--color-primary-600)] hover:underline flex items-center gap-1"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
										前往官網
									</a>
								</div>
							{/if}
						</div>
					{/snippet}
				</Card>

				<!-- Payment History -->
				{#if paymentHistory.length > 0}
					<Card class="mt-6">
						{#snippet children()}
							<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">付款紀錄</h3>
							<div class="space-y-3">
								{#each paymentHistory as payment}
									<div
										class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
									>
										<div>
											<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
												{formatCurrency(payment.amount, payment.currency)}
											</p>
											<p class="text-xs text-gray-500 dark:text-gray-400">
												{formatDate(payment.paidAt)}
											</p>
										</div>
										<Badge
											variant={payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'error'}
											size="sm"
										>
											{#snippet children()}
												{payment.status === 'paid' ? '已付款' : payment.status === 'pending' ? '待處理' : '失敗'}
											{/snippet}
										</Badge>
									</div>
								{/each}
							</div>
						{/snippet}
					</Card>
				{/if}
			</div>

			<!-- Edit form -->
			<div>
				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- 基本資訊 -->
					<Card>
						{#snippet children()}
							<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">基本資訊</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="md:col-span-2">
									<Input
										bind:value={name}
										label="服務名稱"
										placeholder="例如：Netflix、Spotify"
										required
										error={errors.name}
										disabled={saving}
									/>
								</div>
								<Select
									bind:value={category}
									options={categoryOptions}
									label="分類"
									required
									disabled={saving}
								/>
								<Select
									bind:value={status}
									options={statusOptions}
									label="狀態"
									required
									disabled={saving}
								/>
								<div>
									<Input
										bind:value={cost}
										type="number"
										label="費用"
										placeholder="0"
										required
										error={errors.cost}
										disabled={saving}
										min="0"
										step="1"
									/>
								</div>
								<Select
									bind:value={currency}
									options={currencyOptions}
									label="貨幣"
									required
									disabled={saving}
								/>
								<Select
									bind:value={billingCycle}
									options={cycleOptions}
									label="計費週期"
									required
									disabled={saving}
								/>
								<Input
									bind:value={nextBillingDate}
									type="date"
									label="下次扣款日"
									required
									error={errors.nextBillingDate}
									disabled={saving}
								/>
							</div>
						{/snippet}
					</Card>

					<!-- 帳戶與付款 -->
					<Card>
						{#snippet children()}
							<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">帳戶與付款</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Input
									bind:value={accountEmail}
									type="email"
									label="帳號 Email"
									placeholder="user@example.com"
									error={errors.accountEmail}
									disabled={saving}
								/>
								<Select
									bind:value={paymentMethod}
									options={paymentMethodOptions}
									label="付款方式"
									disabled={saving}
								/>
								<Input
									bind:value={website}
									label="官網連結"
									placeholder="https://..."
									error={errors.website}
									disabled={saving}
								/>
								<Input
									bind:value={reminderDays}
									type="number"
									label="提前提醒天數"
									placeholder="例如：3"
									disabled={saving}
									min="0"
									max="30"
								/>
							</div>
							<div class="mt-4">
								<Checkbox bind:checked={autoRenew} label="自動續訂" disabled={saving} />
							</div>
						{/snippet}
					</Card>

					<!-- 備註 -->
					<Card>
						{#snippet children()}
							<h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">備註</h3>
							<div>
								<label
									for="description"
									class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									描述
								</label>
								<textarea
									id="description"
									bind:value={description}
									class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
									rows="3"
									placeholder="輸入備註..."
									disabled={saving}
								></textarea>
							</div>
						{/snippet}
					</Card>

					<!-- Actions -->
					<div class="flex justify-end gap-3">
						<Button variant="outline" href="/subscriptions" disabled={saving}>
							{#snippet children()}取消{/snippet}
						</Button>
						<Button type="submit" loading={saving}>
							{#snippet children()}儲存變更{/snippet}
						</Button>
					</div>
				</form>
			</div>
		</div>
	</PageContainer>
{/if}
