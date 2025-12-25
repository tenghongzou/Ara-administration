<script lang="ts">
	import { Input } from '$lib/components/ui';
	import { DatePicker } from '$lib/components/forms';
	import type { ProfileFormData } from '../types';

	interface Props {
		formData: ProfileFormData;
		errors: Record<string, string>;
		onUpdate: (data: Partial<ProfileFormData>) => void;
	}

	let { formData, errors, onUpdate }: Props = $props();

	function handleNameChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate({ name: target.value });
	}

	function handleEmailChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate({ email: target.value });
	}

	function handlePhoneChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate({ phone: target.value });
	}

	function handleBirthdayChange(value: string) {
		onUpdate({ birthday: value });
	}
</script>

<div class="space-y-4">
	<Input
		value={formData.name}
		onchange={handleNameChange}
		label="顯示名稱"
		placeholder="請輸入顯示名稱"
		error={errors.name}
		required
	/>
	<Input
		value={formData.email}
		onchange={handleEmailChange}
		type="email"
		label="電子郵件"
		placeholder="請輸入電子郵件"
		error={errors.email}
		required
	/>
	<Input
		value={formData.phone}
		onchange={handlePhoneChange}
		type="tel"
		label="電話號碼"
		placeholder="請輸入電話號碼"
		error={errors.phone}
	/>
	<DatePicker
		value={formData.birthday}
		onchange={handleBirthdayChange}
		label="生日"
		placeholder="選擇生日"
		max={new Date().toISOString().split('T')[0]}
	/>
</div>
