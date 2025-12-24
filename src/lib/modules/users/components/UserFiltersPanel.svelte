<script lang="ts">
	import { Input, Select, Button } from '$lib/components/ui';
	import { roleFilterOptions, statusFilterOptions } from '../types';

	interface Props {
		search: string;
		roleFilter: string;
		statusFilter: string;
		onSearch: () => void;
	}

	let { search = $bindable(), roleFilter = $bindable(), statusFilter = $bindable(), onSearch }: Props = $props();
</script>

<div
	class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
	data-testid="users-filters"
>
	<div class="flex flex-col lg:flex-row gap-4">
		<div class="flex-1">
			<Input
				bind:value={search}
				placeholder="搜尋使用者名稱或電子郵件..."
				onchange={onSearch}
				id="user-search"
			/>
		</div>
		<div class="flex flex-wrap gap-2">
			<div class="w-36">
				<Select
					bind:value={roleFilter}
					options={roleFilterOptions}
					placeholder="角色"
					onchange={onSearch}
				/>
			</div>
			<div class="w-36">
				<Select
					bind:value={statusFilter}
					options={statusFilterOptions}
					placeholder="狀態"
					onchange={onSearch}
				/>
			</div>
			<Button variant="outline" onclick={onSearch}>
				{#snippet children()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					搜尋
				{/snippet}
			</Button>
		</div>
	</div>
</div>
