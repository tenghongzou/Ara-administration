/**
 * 日誌導出服務
 */

import type { AuditLog } from '$lib/types';
import type { ExportFormat, ExportOptions } from '../types';
import { logsService } from './logs.service';

/**
 * 導出欄位配置
 */
export const exportFields = [
	{ key: 'createdAt', label: '時間', default: true },
	{ key: 'userName', label: '使用者', default: true },
	{ key: 'action', label: '操作', default: true },
	{ key: 'resource', label: '資源', default: true },
	{ key: 'description', label: '描述', default: true },
	{ key: 'ipAddress', label: 'IP 位址', default: true },
	{ key: 'status', label: '狀態', default: true },
	{ key: 'userAgent', label: '瀏覽器資訊', default: false },
	{ key: 'userId', label: '使用者 ID', default: false },
	{ key: 'resourceId', label: '資源 ID', default: false }
] as const;

/**
 * 導出格式選項
 */
export const formatOptions: Array<{ value: ExportFormat; label: string; description: string }> = [
	{ value: 'csv', label: 'CSV', description: '適合 Excel 開啟和數據分析' },
	{ value: 'json', label: 'JSON', description: '適合程式處理和備份' },
	{ value: 'excel', label: 'Excel', description: '直接生成 Excel 檔案' }
];

class LogsExportService {
	/**
	 * 導出為 CSV
	 */
	exportToCSV(logs: AuditLog[], fields: string[]): string {
		const headers = fields.map((field) => {
			const config = exportFields.find((f) => f.key === field);
			return config?.label || field;
		});

		const rows = logs.map((log) =>
			fields.map((field) => {
				const value = this.formatFieldValue(log, field);
				// CSV 轉義
				if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
					return `"${value.replace(/"/g, '""')}"`;
				}
				return value;
			})
		);

		return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
	}

	/**
	 * 導出為 JSON
	 */
	exportToJSON(logs: AuditLog[], fields: string[]): string {
		const data = logs.map((log) => {
			const obj: Record<string, unknown> = {};
			fields.forEach((field) => {
				obj[field] = this.formatFieldValue(log, field, false);
			});
			return obj;
		});

		return JSON.stringify(data, null, 2);
	}

	/**
	 * 導出為 Excel (使用 CSV 格式，Excel 可以直接開啟)
	 */
	exportToExcel(logs: AuditLog[], fields: string[]): string {
		// 加入 BOM 以支援 Excel 正確顯示中文
		const bom = '\uFEFF';
		return bom + this.exportToCSV(logs, fields);
	}

	/**
	 * 格式化欄位值
	 */
	private formatFieldValue(
		log: AuditLog,
		field: string,
		forDisplay: boolean = true
	): string | unknown {
		switch (field) {
			case 'createdAt':
				return forDisplay ? logsService.formatTimestamp(log.createdAt) : log.createdAt;
			case 'action':
				return forDisplay ? logsService.getActionLabel(log.action) : log.action;
			case 'resource':
				return forDisplay ? logsService.getResourceLabel(log.resource) : log.resource;
			case 'status':
				return forDisplay ? (log.status === 'success' ? '成功' : '失敗') : log.status;
			case 'ipAddress':
				return log.ipAddress || '';
			case 'description':
				return log.description || '';
			case 'userName':
				return log.userName || '';
			case 'userAgent':
				return log.userAgent || '';
			case 'userId':
				return log.userId || '';
			case 'resourceId':
				return log.resourceId || '';
			default:
				return (log as unknown as Record<string, unknown>)[field] || '';
		}
	}

	/**
	 * 執行導出
	 */
	export(logs: AuditLog[], options: ExportOptions): { content: string; filename: string } {
		const { format, includeFields } = options;
		const timestamp = new Date().toISOString().slice(0, 10);

		let content: string;
		let extension: string;

		switch (format) {
			case 'csv':
				content = this.exportToCSV(logs, includeFields);
				extension = 'csv';
				break;
			case 'json':
				content = this.exportToJSON(logs, includeFields);
				extension = 'json';
				break;
			case 'excel':
				content = this.exportToExcel(logs, includeFields);
				extension = 'csv';
				break;
			default:
				throw new Error(`Unsupported format: ${format}`);
		}

		return {
			content,
			filename: `audit_logs_${timestamp}.${extension}`
		};
	}

	/**
	 * 下載導出檔案
	 */
	download(logs: AuditLog[], options: ExportOptions): void {
		const { content, filename } = this.export(logs, options);

		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}

	/**
	 * 取得預設導出欄位
	 */
	getDefaultFields(): string[] {
		return exportFields.filter((f) => f.default).map((f) => f.key);
	}
}

export const logsExportService = new LogsExportService();
