<script lang="ts">
	import type { Role } from '$lib/types';
	import RolesDataGrid from './RolesDataGrid.svelte';

	interface Props {
		roles: Role[];
		loading?: boolean;
		onRefresh?: () => void;
		onDelete?: (role: Role) => void;
	}

	let { roles, loading = false, onRefresh, onDelete }: Props = $props();
</script>

<RolesDataGrid {roles} {loading} {onRefresh} {onDelete} />
