import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({
	browser: true
}));

import { notificationSettings } from '$lib/stores/notification-settings';

describe('Notification Settings Store', () => {
	beforeEach(() => {
		localStorage.clear();
		notificationSettings.reset();
	});

	describe('Initial State', () => {
		it('should have default email settings', () => {
			const settings = get(notificationSettings);

			expect(settings.email.enabled).toBe(true);
			expect(settings.email.securityAlerts).toBe(true);
			expect(settings.email.marketing).toBe(false);
			expect(settings.email.weeklyReport).toBe(false);
			expect(settings.email.subscriptionReminders).toBe(true);
		});

		it('should have default push settings', () => {
			const settings = get(notificationSettings);

			expect(settings.push.enabled).toBe(false);
			expect(settings.push.permission).toBe('default');
			expect(settings.push.securityAlerts).toBe(true);
		});

		it('should have default in-app settings', () => {
			const settings = get(notificationSettings);

			expect(settings.inApp.enabled).toBe(true);
			expect(settings.inApp.showBadge).toBe(true);
			expect(settings.inApp.playSound).toBe(false);
			expect(settings.inApp.desktopPopup).toBe(true);
		});

		it('should have default quiet hours settings', () => {
			const settings = get(notificationSettings);

			expect(settings.quietHours.enabled).toBe(false);
			expect(settings.quietHours.startTime).toBe('22:00');
			expect(settings.quietHours.endTime).toBe('08:00');
			expect(settings.quietHours.allowUrgent).toBe(true);
		});
	});

	describe('Update Settings', () => {
		it('should update email settings partially', () => {
			notificationSettings.update({
				email: { enabled: false, marketing: true }
			});

			const settings = get(notificationSettings);

			expect(settings.email.enabled).toBe(false);
			expect(settings.email.marketing).toBe(true);
			// Other email settings should remain default
			expect(settings.email.securityAlerts).toBe(true);
		});

		it('should update push settings partially', () => {
			notificationSettings.update({
				push: { enabled: true, permission: 'granted' }
			});

			const settings = get(notificationSettings);

			expect(settings.push.enabled).toBe(true);
			expect(settings.push.permission).toBe('granted');
			expect(settings.push.securityAlerts).toBe(true);
		});

		it('should update in-app settings', () => {
			notificationSettings.update({
				inApp: { playSound: true }
			});

			const settings = get(notificationSettings);

			expect(settings.inApp.playSound).toBe(true);
			expect(settings.inApp.enabled).toBe(true);
		});

		it('should update quiet hours settings', () => {
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '23:00', endTime: '07:00' }
			});

			const settings = get(notificationSettings);

			expect(settings.quietHours.enabled).toBe(true);
			expect(settings.quietHours.startTime).toBe('23:00');
			expect(settings.quietHours.endTime).toBe('07:00');
			// Unchanged values preserved
			expect(settings.quietHours.allowUrgent).toBe(true);
		});

		it('should set complete settings', () => {
			const newSettings = {
				email: {
					enabled: false,
					securityAlerts: false,
					loginNotifications: false,
					systemUpdates: false,
					weeklyReport: false,
					subscriptionReminders: false,
					marketing: false
				},
				push: {
					enabled: true,
					permission: 'granted' as const,
					securityAlerts: true,
					loginNotifications: true,
					systemAlerts: true,
					mentions: true,
					subscriptionReminders: true
				},
				inApp: {
					enabled: false,
					showBadge: false,
					playSound: false,
					desktopPopup: false,
					autoMarkRead: true
				},
				quietHours: {
					enabled: true,
					startTime: '21:00',
					endTime: '09:00',
					timezone: 'America/New_York',
					allowUrgent: false
				}
			};

			notificationSettings.set(newSettings);

			const settings = get(notificationSettings);
			expect(settings).toEqual(newSettings);
		});
	});

	describe('Quiet Hours Calculation', () => {
		it('should return false when quiet hours is disabled', () => {
			notificationSettings.update({
				quietHours: { enabled: false }
			});

			expect(notificationSettings.isQuietHours()).toBe(false);
		});

		it('should detect quiet hours within same-day range', () => {
			// Set quiet hours 09:00 - 17:00
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '09:00', endTime: '17:00' }
			});

			// Mock a time within the range, e.g. 12:00
			const mockDate = new Date(2024, 0, 15, 12, 0, 0);
			vi.setSystemTime(mockDate);

			expect(notificationSettings.isQuietHours()).toBe(true);
		});

		it('should detect outside quiet hours within same-day range', () => {
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '09:00', endTime: '17:00' }
			});

			// Mock a time outside the range, e.g. 20:00
			const mockDate = new Date(2024, 0, 15, 20, 0, 0);
			vi.setSystemTime(mockDate);

			expect(notificationSettings.isQuietHours()).toBe(false);
		});

		it('should handle cross-midnight quiet hours - during quiet period (late night)', () => {
			// Set quiet hours 22:00 - 08:00 (crosses midnight)
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '22:00', endTime: '08:00' }
			});

			// Mock 23:00 (should be quiet)
			const mockDate = new Date(2024, 0, 15, 23, 0, 0);
			vi.setSystemTime(mockDate);

			expect(notificationSettings.isQuietHours()).toBe(true);
		});

		it('should handle cross-midnight quiet hours - during quiet period (early morning)', () => {
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '22:00', endTime: '08:00' }
			});

			// Mock 05:00 (should be quiet)
			const mockDate = new Date(2024, 0, 16, 5, 0, 0);
			vi.setSystemTime(mockDate);

			expect(notificationSettings.isQuietHours()).toBe(true);
		});

		it('should handle cross-midnight quiet hours - outside quiet period (daytime)', () => {
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '22:00', endTime: '08:00' }
			});

			// Mock 14:00 (should NOT be quiet)
			const mockDate = new Date(2024, 0, 15, 14, 0, 0);
			vi.setSystemTime(mockDate);

			expect(notificationSettings.isQuietHours()).toBe(false);
		});

		it('should handle edge case at exact start time', () => {
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '22:00', endTime: '08:00' }
			});

			const mockDate = new Date(2024, 0, 15, 22, 0, 0);
			vi.setSystemTime(mockDate);

			expect(notificationSettings.isQuietHours()).toBe(true);
		});

		it('should handle edge case at exact end time', () => {
			notificationSettings.update({
				quietHours: { enabled: true, startTime: '22:00', endTime: '08:00' }
			});

			// At 08:00, quiet hours should be over (endTime is exclusive)
			const mockDate = new Date(2024, 0, 16, 8, 0, 0);
			vi.setSystemTime(mockDate);

			expect(notificationSettings.isQuietHours()).toBe(false);
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		beforeEach(() => {
			vi.useFakeTimers();
		});
	});

	describe('Helper Methods', () => {
		it('shouldShowInApp should return true when in-app and popup are enabled', () => {
			notificationSettings.update({
				inApp: { enabled: true, desktopPopup: true }
			});
			expect(notificationSettings.shouldShowInApp()).toBe(true);
		});

		it('shouldShowInApp should return false when in-app is disabled', () => {
			notificationSettings.update({
				inApp: { enabled: false }
			});
			expect(notificationSettings.shouldShowInApp()).toBe(false);
		});

		it('shouldPlaySound should reflect settings', () => {
			expect(notificationSettings.shouldPlaySound()).toBe(false);

			notificationSettings.update({
				inApp: { playSound: true }
			});
			expect(notificationSettings.shouldPlaySound()).toBe(true);
		});

		it('shouldSendPush should require enabled and granted permission', () => {
			expect(notificationSettings.shouldSendPush()).toBe(false);

			notificationSettings.update({
				push: { enabled: true, permission: 'granted' }
			});
			expect(notificationSettings.shouldSendPush()).toBe(true);
		});

		it('shouldSendPush should return false when permission is denied', () => {
			notificationSettings.update({
				push: { enabled: true, permission: 'denied' }
			});
			expect(notificationSettings.shouldSendPush()).toBe(false);
		});

		it('getSettings should return current snapshot', () => {
			const snapshot = notificationSettings.getSettings();
			expect(snapshot.email.enabled).toBe(true);
			expect(snapshot.quietHours.enabled).toBe(false);
		});
	});

	describe('localStorage Persistence', () => {
		it('should save settings to localStorage on update', () => {
			notificationSettings.update({
				email: { marketing: true }
			});

			const stored = localStorage.getItem('notification-settings');
			expect(stored).not.toBeNull();

			const parsed = JSON.parse(stored!);
			expect(parsed.email.marketing).toBe(true);
		});

		it('should save settings to localStorage on set', () => {
			const settings = notificationSettings.getSettings();
			settings.push.enabled = true;
			notificationSettings.set(settings);

			const stored = localStorage.getItem('notification-settings');
			const parsed = JSON.parse(stored!);
			expect(parsed.push.enabled).toBe(true);
		});

		it('should clear localStorage on reset', () => {
			notificationSettings.update({ email: { marketing: true } });
			expect(localStorage.getItem('notification-settings')).not.toBeNull();

			notificationSettings.reset();
			expect(localStorage.getItem('notification-settings')).toBeNull();
		});
	});
});
