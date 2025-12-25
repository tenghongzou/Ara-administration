<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { config } from '$lib/constants';
	import { subscriptionsApi } from '$lib/services';
	import type { Subscription, PaymentHistory } from '$lib/types';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import {
		SubscriptionDetailContent,
		subscriptionsService,
		type SubscriptionFormData,
		type SubscriptionFormErrors
	} from '$lib/modules/subscriptions';

	let subscription = $state<Subscription | null>(null);
	let paymentHistory = $state<PaymentHistory[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let formData = $state<SubscriptionFormData>(subscriptionsService.createEmptyFormData());
	let errors = $state<SubscriptionFormErrors>({});

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
			formData = subscriptionsService.subscriptionToFormData(sub);
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

	async function handleSubmit(data: SubscriptionFormData) {
		if (!subscription) return;

		// Validate
		const validationErrors = subscriptionsService.validateForm(data);
		if (!subscriptionsService.isFormValid(validationErrors)) {
			errors = validationErrors;
			return;
		}

		errors = {};
		saving = true;

		try {
			const apiData = subscriptionsService.formDataToApiData(data);
			await subscriptionsApi.updateSubscription(subscription.id, apiData);
			toast.success('訂閱已更新');
			goto('/subscriptions');
		} catch (error) {
			toast.error('更新訂閱失敗');
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto('/subscriptions');
	}
</script>

<svelte:head>
	<title>{subscription?.name || '編輯訂閱'} - {config.appName}</title>
</svelte:head>

<PageContainer
	title="編輯訂閱"
	description={subscription?.name || ''}
	backLink="/subscriptions"
	backLabel="返回訂閱列表"
>
	<SubscriptionDetailContent
		{subscription}
		{paymentHistory}
		{loading}
		{saving}
		bind:formData
		{errors}
		onSubmit={handleSubmit}
		onCancel={handleCancel}
	/>
</PageContainer>
