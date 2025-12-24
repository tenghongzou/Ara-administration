/**
 * Logs 服務
 * 負責日誌相關的業務邏輯處理
 */

import type { AuditLog } from '$lib/services/mock-data';
import type { LogFilters, LogStats, LogOption } from '../types';

/**
 * 操作類型選項
 */
export const actionOptions: LogOption[] = [
	{ value: '', label: '全部操作', icon: '📋' },
	{ value: 'LOGIN', label: '登入', icon: '🔑' },
	{ value: 'LOGOUT', label: '登出', icon: '🚪' },
	{ value: 'CREATE', label: '新增', icon: '➕' },
	{ value: 'UPDATE', label: '修改', icon: '✏️' },
	{ value: 'DELETE', label: '刪除', icon: '🗑️' },
	{ value: 'EXPORT', label: '匯出', icon: '📤' },
	{ value: 'IMPORT', label: '匯入', icon: '📥' },
	{ value: 'DEPLOY', label: '部署', icon: '🚀' }
];

/**
 * 資源類型選項
 */
export const resourceOptions: LogOption[] = [
	{ value: '', label: '全部資源', icon: '📁' },
	{ value: 'auth', label: '身份驗證', icon: '🔐' },
	{ value: 'user', label: '使用者', icon: '👤' },
	{ value: 'settings', label: '系統設定', icon: '⚙️' },
	{ value: 'content', label: '內容管理', icon: '📝' },
	{ value: 'system', label: '系統', icon: '💻' },
	{ value: 'report', label: '報表', icon: '📊' }
];

/**
 * 狀態選項
 */
export const statusOptions: LogOption[] = [
	{ value: '', label: '全部狀態', icon: '🔘' },
	{ value: 'success', label: '成功', icon: '✅' },
	{ value: 'failure', label: '失敗', icon: '❌' }
];

/**
 * 操作標籤對照
 */
export const actionLabels: Record<string, string> = {
	LOGIN: '登入',
	LOGOUT: '登出',
	CREATE: '新增',
	UPDATE: '修改',
	DELETE: '刪除',
	EXPORT: '匯出',
	IMPORT: '匯入',
	DEPLOY: '部署'
};

/**
 * 資源標籤對照
 */
export const resourceLabels: Record<string, string> = {
	auth: '身份驗證',
	user: '使用者',
	settings: '系統設定',
	content: '內容管理',
	system: '系統',
	report: '報表'
};

class LogsService {
	/**
	 * 過濾日誌
	 */
	filterLogs(logs: AuditLog[], filters: LogFilters): AuditLog[] {
		let filtered = [...logs];

		// 操作類型過濾
		if (filters.action) {
			filtered = filtered.filter((log) => log.action === filters.action);
		}

		// 資源類型過濾
		if (filters.resource) {
			filtered = filtered.filter((log) => log.resource === filters.resource);
		}

		// 狀態過濾
		if (filters.status) {
			filtered = filtered.filter((log) => log.status === filters.status);
		}

		// 使用者過濾
		if (filters.userId) {
			filtered = filtered.filter((log) => log.userId === filters.userId);
		}

		// 搜尋過濾
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				(log) =>
					log.userName.toLowerCase().includes(searchLower) ||
					log.details?.toLowerCase().includes(searchLower) ||
					log.ip.includes(searchLower)
			);
		}

		// 日期範圍過濾
		if (filters.dateRange) {
			const startDate = new Date(filters.dateRange.start).getTime();
			const endDate = new Date(filters.dateRange.end).getTime();

			filtered = filtered.filter((log) => {
				const logDate = new Date(log.timestamp).getTime();
				return logDate >= startDate && logDate <= endDate;
			});
		}

		return filtered;
	}

	/**
	 * 計算日誌統計
	 */
	calculateStats(logs: AuditLog[]): LogStats {
		const stats: LogStats = {
			total: logs.length,
			successCount: 0,
			failureCount: 0,
			byAction: {},
			byResource: {},
			byDay: []
		};

		const dayMap = new Map<string, number>();

		logs.forEach((log) => {
			// 狀態統計
			if (log.status === 'success') {
				stats.successCount++;
			} else {
				stats.failureCount++;
			}

			// 操作統計
			stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

			// 資源統計
			stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;

			// 日統計
			const day = new Date(log.timestamp).toISOString().split('T')[0];
			dayMap.set(day, (dayMap.get(day) || 0) + 1);
		});

		// 轉換日統計為陣列
		stats.byDay = Array.from(dayMap.entries())
			.map(([date, count]) => ({ date, count }))
			.sort((a, b) => a.date.localeCompare(b.date));

		return stats;
	}

	/**
	 * 格式化時間戳
	 */
	formatTimestamp(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	/**
	 * 格式化完整時間戳（包含星期）
	 */
	formatFullTimestamp(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleString('zh-TW', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	/**
	 * 格式化相對時間
	 */
	formatRelativeTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 1) return '剛剛';
		if (minutes < 60) return `${minutes} 分鐘前`;
		if (hours < 24) return `${hours} 小時前`;
		if (days < 7) return `${days} 天前`;

		return this.formatTimestamp(timestamp);
	}

	/**
	 * 取得操作標籤
	 */
	getActionLabel(action: string): string {
		return actionLabels[action] || action;
	}

	/**
	 * 取得資源標籤
	 */
	getResourceLabel(resource: string): string {
		return resourceLabels[resource] || resource;
	}

	/**
	 * 取得狀態徽章資訊
	 */
	getStatusBadge(status: 'success' | 'failure'): { variant: 'success' | 'error'; label: string } {
		return status === 'success'
			? { variant: 'success', label: '成功' }
			: { variant: 'error', label: '失敗' };
	}

	/**
	 * 取得操作圖示
	 */
	getActionIcon(action: string): string {
		const option = actionOptions.find((opt) => opt.value === action);
		return option?.icon || '📋';
	}

	/**
	 * 取得資源圖示
	 */
	getResourceIcon(resource: string): string {
		const option = resourceOptions.find((opt) => opt.value === resource);
		return option?.icon || '📁';
	}

	/**
	 * 解析 User Agent
	 */
	parseUserAgent(userAgent: string): { browser: string; os: string } {
		let browser = '未知瀏覽器';
		let os = '未知系統';

		// 瀏覽器識別
		if (userAgent.includes('Chrome')) browser = 'Chrome';
		else if (userAgent.includes('Firefox')) browser = 'Firefox';
		else if (userAgent.includes('Safari')) browser = 'Safari';
		else if (userAgent.includes('Edge')) browser = 'Edge';

		// 系統識別
		if (userAgent.includes('Windows')) os = 'Windows';
		else if (userAgent.includes('Mac')) os = 'macOS';
		else if (userAgent.includes('Linux')) os = 'Linux';
		else if (userAgent.includes('Android')) os = 'Android';
		else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

		return { browser, os };
	}
}

export const logsService = new LogsService();
