import { writable } from 'svelte/store';
import { generateUUID } from '$lib/utils';

export interface ToastItem {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);

	function add(item: Omit<ToastItem, 'id'>) {
		const id = generateUUID();
		const toast: ToastItem = { ...item, id };

		update((toasts) => [...toasts, toast]);

		if (item.duration !== 0) {
			setTimeout(() => dismiss(id), item.duration || 5000);
		}

		return id;
	}

	function dismiss(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	function clear() {
		update(() => []);
	}

	return {
		subscribe,
		success: (message: string, duration?: number) => add({ type: 'success', message, duration }),
		error: (message: string, duration?: number) => add({ type: 'error', message, duration }),
		warning: (message: string, duration?: number) => add({ type: 'warning', message, duration }),
		info: (message: string, duration?: number) => add({ type: 'info', message, duration }),
		dismiss,
		clear
	};
}

export const toast = createToastStore();
