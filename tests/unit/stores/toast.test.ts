import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { toast } from '$lib/stores/toast';

describe('Toast Store', () => {
	beforeEach(() => {
		toast.clear();
	});

	afterEach(() => {
		toast.clear();
	});

	it('should start with empty toasts', () => {
		const toasts = get(toast);
		expect(toasts).toHaveLength(0);
	});

	it('should add success toast', () => {
		toast.success('Success message');
		const toasts = get(toast);

		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('success');
		expect(toasts[0].message).toBe('Success message');
	});

	it('should add error toast', () => {
		toast.error('Error message');
		const toasts = get(toast);

		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('error');
		expect(toasts[0].message).toBe('Error message');
	});

	it('should add warning toast', () => {
		toast.warning('Warning message');
		const toasts = get(toast);

		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('warning');
		expect(toasts[0].message).toBe('Warning message');
	});

	it('should add info toast', () => {
		toast.info('Info message');
		const toasts = get(toast);

		expect(toasts).toHaveLength(1);
		expect(toasts[0].type).toBe('info');
		expect(toasts[0].message).toBe('Info message');
	});

	it('should dismiss specific toast', () => {
		const id = toast.success('To be dismissed');
		expect(get(toast)).toHaveLength(1);

		toast.dismiss(id);
		expect(get(toast)).toHaveLength(0);
	});

	it('should clear all toasts', () => {
		toast.success('Toast 1');
		toast.error('Toast 2');
		toast.warning('Toast 3');

		expect(get(toast)).toHaveLength(3);

		toast.clear();
		expect(get(toast)).toHaveLength(0);
	});

	it('should auto dismiss after duration', async () => {
		vi.useFakeTimers();

		toast.success('Auto dismiss', 1000);
		expect(get(toast)).toHaveLength(1);

		vi.advanceTimersByTime(1100);
		expect(get(toast)).toHaveLength(0);

		vi.useRealTimers();
	});

	it('should not auto dismiss when duration is 0', async () => {
		vi.useFakeTimers();

		toast.success('No auto dismiss', 0);
		expect(get(toast)).toHaveLength(1);

		vi.advanceTimersByTime(10000);
		expect(get(toast)).toHaveLength(1);

		vi.useRealTimers();
	});

	it('should generate unique IDs for each toast', () => {
		toast.success('Toast 1');
		toast.success('Toast 2');
		const toasts = get(toast);

		expect(toasts[0].id).not.toBe(toasts[1].id);
	});
});
