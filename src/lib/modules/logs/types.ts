/**
 * Logs 模組類型定義
 */

// 重新匯出基礎類型
export type { AuditLog, AuditLogAction, AuditLogStatistics, AuditLogFilters } from '$lib/types';

/**
 * 日誌操作類型（匹配後端）
 */
export type LogAction =
	| 'login'
	| 'logout'
	| 'create'
	| 'update'
	| 'delete'
	| 'view'
	| 'export'
	| 'import';

/**
 * 日誌資源類型（匹配後端）
 */
export type LogResource =
	| 'auth'
	| 'user'
	| 'role'
	| 'permission'
	| 'subscription'
	| 'notification'
	| 'settings';

/**
 * 日誌狀態
 */
export type LogStatus = 'success' | 'failure';

/**
 * 日誌篩選器
 */
export interface LogFilters {
	action?: LogAction | '';
	resource?: LogResource | '';
	status?: LogStatus | '';
	search?: string;
	userId?: string;
	dateRange?: {
		start: string;
		end: string;
	};
}

/**
 * 日誌統計
 */
export interface LogStats {
	total: number;
	successCount: number;
	failureCount: number;
	byAction: Record<string, number>;
	byResource: Record<string, number>;
	byDay: Array<{ date: string; count: number }>;
}

/**
 * 導出格式
 */
export type ExportFormat = 'csv' | 'json' | 'excel';

/**
 * 導出選項
 */
export interface ExportOptions {
	format: ExportFormat;
	includeFields: string[];
	dateRange?: {
		start: string;
		end: string;
	};
	filters?: LogFilters;
}

/**
 * 選項配置
 */
export interface LogOption {
	value: string;
	label: string;
	icon?: string;
}

/**
 * 日誌詳情
 */
export interface LogDetail {
	log: import('$lib/types').AuditLog;
	changes?: {
		field: string;
		oldValue: unknown;
		newValue: unknown;
	}[];
}
