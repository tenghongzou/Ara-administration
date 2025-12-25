<script lang="ts">
	import { goto } from '$app/navigation';
	import { config } from '$lib/constants';
	import { subscriptionsApi } from '$lib/services';
	import { toast } from '$lib/stores/toast';
	import { PageContainer } from '$lib/components/layout';
	import {
		SubscriptionForm,
		subscriptionsService,
		type SubscriptionFormData,
		type SubscriptionFormErrors
	} from '$lib/modules/subscriptions';

	let formData = $state<SubscriptionFormData>(subscriptionsService.createEmptyFormData());
	let errors = $state<SubscriptionFormErrors>({});
	let saving = $state(false);

	async function handleSubmit(data: SubscriptionFormData) {
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
			await subscriptionsApi.createSubscription(apiData);
			toast.success('訂閱已建立');
			goto('/subscriptions');
		} catch (error) {
			toast.error('建立訂閱失敗');
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto('/subscriptions');
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
	<SubscriptionForm
		bind:formData
		{errors}
		{saving}
		submitLabel="建立訂閱"
		onsubmit={handleSubmit}
		oncancel={handleCancel}
	/>
</PageContainer>
