import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// 重定向到 /settings/users/new
	throw redirect(307, '/settings/users/new');
};
