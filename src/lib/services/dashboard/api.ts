/**
 * 儀表板 API 模組
 */

import { mockDashboardStats, mockRecentActivities } from '../mock-data';
import { delay } from '../core';

export const dashboardApi = {
	async getStats() {
		await delay(500);
		return mockDashboardStats;
	},

	async getRecentActivities() {
		await delay(400);
		return mockRecentActivities;
	}
};
