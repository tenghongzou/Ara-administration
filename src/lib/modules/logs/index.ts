// Types
export type {
	AuditLog,
	LogAction,
	LogResource,
	LogStatus,
	LogFilters,
	LogStats,
	ExportFormat,
	ExportOptions,
	LogOption,
	LogDetail
} from './types';

// Services
export {
	logsService,
	actionOptions,
	resourceOptions,
	statusOptions,
	actionLabels,
	resourceLabels
} from './services/logs.service';

export {
	logsExportService,
	exportFields,
	formatOptions
} from './services/logs-export';

// Components
export { default as LogDetailModal } from './components/LogDetail.svelte';
export { default as LogFiltersPanel } from './components/LogFilters.svelte';
export { default as LogStatsPanel } from './components/LogStats.svelte';
export { default as LogExportDialog } from './components/LogExportDialog.svelte';

// Module config for registration
import type { ModuleConfig } from '../types';
import { navIcons } from '../navigation';

export const logsModuleConfig: ModuleConfig = {
	id: 'logs',
	name: '稽核日誌',
	description: '系統操作記錄與安全事件',
	basePath: '/settings/logs',
	navigation: [
		{
			id: 'logs',
			label: '稽核日誌',
			href: '/settings/logs',
			icon: navIcons.logs,
			order: 50
		}
	],
	enabled: true
};
