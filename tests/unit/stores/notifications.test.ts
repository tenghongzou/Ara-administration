import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { notifications, unreadCount } from '$lib/stores/notifications';

describe('Notifications Store', () => {
	beforeEach(() => {
		notifications.clear();
	});

	it('should start empty after clear', () => {
		const state = get(notifications);
		expect(state.items).toHaveLength(0);
		expect(state.isOpen).toBe(false);
	});

	it('should add notification', () => {
		notifications.add({
			type: 'info',
			title: 'Test Title',
			message: 'Test Message'
		});

		const state = get(notifications);
		expect(state.items).toHaveLength(1);
		expect(state.items[0].title).toBe('Test Title');
		expect(state.items[0].message).toBe('Test Message');
		expect(state.items[0].type).toBe('info');
		expect(state.items[0].read).toBe(false);
	});

	it('should add notification with all types', () => {
		notifications.add({ type: 'success', title: 'Success', message: 'msg' });
		notifications.add({ type: 'warning', title: 'Warning', message: 'msg' });
		notifications.add({ type: 'error', title: 'Error', message: 'msg' });
		notifications.add({ type: 'info', title: 'Info', message: 'msg' });

		const items = get(notifications).items;
		expect(items).toHaveLength(4);
		expect(items.map((n) => n.type)).toEqual(['info', 'error', 'warning', 'success']);
	});

	it('should remove notification by id', async () => {
		notifications.add({ type: 'info', title: 'Test 1', message: 'msg' });
		await new Promise((r) => setTimeout(r, 5)); // Ensure unique timestamp
		notifications.add({ type: 'info', title: 'Test 2', message: 'msg' });

		const items = get(notifications).items;
		const idToRemove = items[0].id;

		notifications.remove(idToRemove);

		const updatedItems = get(notifications).items;
		expect(updatedItems).toHaveLength(1);
		expect(updatedItems.find((n) => n.id === idToRemove)).toBeUndefined();
	});

	it('should mark notification as read', () => {
		notifications.add({ type: 'info', title: 'Test', message: 'msg' });

		const id = get(notifications).items[0].id;
		expect(get(notifications).items[0].read).toBe(false);

		notifications.markAsRead(id);
		expect(get(notifications).items[0].read).toBe(true);
	});

	it('should mark all notifications as read', () => {
		notifications.add({ type: 'info', title: 'Test 1', message: 'msg' });
		notifications.add({ type: 'info', title: 'Test 2', message: 'msg' });
		notifications.add({ type: 'info', title: 'Test 3', message: 'msg' });

		notifications.markAllAsRead();

		const items = get(notifications).items;
		expect(items.every((n) => n.read === true)).toBe(true);
	});

	it('should toggle open state', () => {
		expect(get(notifications).isOpen).toBe(false);

		notifications.toggle();
		expect(get(notifications).isOpen).toBe(true);

		notifications.toggle();
		expect(get(notifications).isOpen).toBe(false);
	});

	it('should open notifications panel', () => {
		notifications.open();
		expect(get(notifications).isOpen).toBe(true);
	});

	it('should close notifications panel', () => {
		notifications.open();
		notifications.close();
		expect(get(notifications).isOpen).toBe(false);
	});

	it('should clear all notifications', () => {
		notifications.add({ type: 'info', title: 'Test 1', message: 'msg' });
		notifications.add({ type: 'info', title: 'Test 2', message: 'msg' });

		notifications.clear();
		expect(get(notifications).items).toHaveLength(0);
	});

	describe('unreadCount derived store', () => {
		it('should count unread notifications', () => {
			notifications.add({ type: 'info', title: 'Test 1', message: 'msg' });
			notifications.add({ type: 'info', title: 'Test 2', message: 'msg' });
			notifications.add({ type: 'info', title: 'Test 3', message: 'msg' });

			expect(get(unreadCount)).toBe(3);
		});

		it('should update when notifications are marked as read', async () => {
			notifications.add({ type: 'info', title: 'Test 1', message: 'msg' });
			await new Promise((r) => setTimeout(r, 5)); // Ensure unique timestamp
			notifications.add({ type: 'info', title: 'Test 2', message: 'msg' });

			const id = get(notifications).items[0].id;
			notifications.markAsRead(id);

			expect(get(unreadCount)).toBe(1);
		});

		it('should be zero when all are read', () => {
			notifications.add({ type: 'info', title: 'Test', message: 'msg' });
			notifications.markAllAsRead();

			expect(get(unreadCount)).toBe(0);
		});

		it('should be zero when empty', () => {
			expect(get(unreadCount)).toBe(0);
		});
	});

	it('should generate unique IDs', async () => {
		notifications.add({ type: 'info', title: 'Test 1', message: 'msg' });
		await new Promise((r) => setTimeout(r, 5)); // Ensure unique timestamp for ID
		notifications.add({ type: 'info', title: 'Test 2', message: 'msg' });

		const items = get(notifications).items;
		expect(items[0].id).not.toBe(items[1].id);
	});

	it('should include createdAt on added notifications', () => {
		const before = new Date().toISOString();
		notifications.add({ type: 'info', title: 'Test', message: 'msg' });
		const after = new Date().toISOString();

		const createdAt = get(notifications).items[0].createdAt;
		expect(createdAt >= before).toBe(true);
		expect(createdAt <= after).toBe(true);
	});

	it('should add notification with optional link', () => {
		notifications.add({
			type: 'info',
			title: 'Test',
			message: 'msg',
			link: '/some-page'
		});

		expect(get(notifications).items[0].link).toBe('/some-page');
	});
});
