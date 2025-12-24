<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { subscriptionsApi } from '$lib/services';
	import type { ServiceCategory, BillingCycle, PaymentMethod, SubscriptionStatus } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import { Button, Input, Select, Card, Checkbox } from '$lib/components/ui';

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

	let saving = $state(false);
	let errors = $state<Record<string, string>>({});

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
		{ value: 'paused', label: '已暫停' }
	];

	const paymentMethodOptions = [
		{ value: '', label: '請選擇' },
		{ value: 'credit_card', label: '信用卡' },
		{ value: 'debit_card', label: '金融卡' },
		{ value: 'bank_transfer', label: '銀行轉帳' },
		{ value: 'paypal', label: 'PayPal' },
		{ value: 'other', label: '其他' }
	];

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

		if (!validate()) return;

		saving = true;
		try {
			await subscriptionsApi.createSubscription({
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
			toast.success('訂閱已建立');
			goto('/subscriptions');
		} catch (error) {
			toast.error('建立訂閱失敗');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>新增訂閱 - {config.appName}</title>
</svelte:head>

<PageContainer
	title="新增訂閱"
	description="新增訂閱服務"
	backLink="/subscriptions"
	backLabel="返回訂閱列表"
>
	<form onsubmit={handleSubmit}>
		<div class="space-y-6">
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
					{#snippet children()}建立訂閱{/snippet}
				</Button>
			</div>
		</div>
	</form>
</PageContainer>
