import type {
	UserRole,
	UserStatus,
	BillingCycle,
	SubscriptionStatus,
	ServiceCategory,
	PaymentMethod
} from '$lib/types';

// ==================== 使用者相關 ====================

export const roleLabels: Record<UserRole, string> = {
	admin: '系統管理員',
	manager: '經理',
	editor: '編輯',
	viewer: '觀察員'
};

export const roleColors: Record<UserRole, string> = {
	admin: 'red',
	manager: 'blue',
	editor: 'green',
	viewer: 'gray'
};

export const statusLabels: Record<UserStatus, string> = {
	active: '啟用',
	inactive: '停用',
	pending: '待審核',
	suspended: '已停權'
};

export const statusColors: Record<UserStatus, 'success' | 'default' | 'warning' | 'error'> = {
	active: 'success',
	inactive: 'default',
	pending: 'warning',
	suspended: 'error'
};

// ==================== 訂閱相關 ====================

export const billingCycleLabels: Record<BillingCycle, string> = {
	weekly: '週繳',
	monthly: '月繳',
	quarterly: '季繳',
	'semi-annual': '半年繳',
	annual: '年繳'
};

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
	active: '啟用中',
	paused: '已暫停',
	cancelled: '已取消',
	expired: '已過期'
};

export const subscriptionStatusColors: Record<
	SubscriptionStatus,
	'success' | 'default' | 'warning' | 'error'
> = {
	active: 'success',
	paused: 'warning',
	cancelled: 'error',
	expired: 'default'
};

export const categoryLabels: Record<ServiceCategory, string> = {
	streaming: '影音串流',
	music: '音樂',
	cloud: '雲端儲存',
	productivity: '生產力工具',
	gaming: '遊戲',
	other: '其他'
};

export const categoryColors: Record<ServiceCategory, string> = {
	streaming: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
	music: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
	cloud: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	productivity: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
	gaming: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
	other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
	credit_card: '信用卡',
	debit_card: '金融卡',
	bank_transfer: '銀行轉帳',
	paypal: 'PayPal',
	other: '其他'
};

// ==================== 審計日誌相關 ====================

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

export const resourceLabels: Record<string, string> = {
	auth: '身份驗證',
	user: '使用者',
	settings: '系統設定',
	content: '內容管理',
	system: '系統',
	report: '報表'
};

// ==================== 通知相關 ====================

export const notificationTypeLabels: Record<string, string> = {
	info: '資訊',
	success: '成功',
	warning: '警告',
	error: '錯誤',
	security: '安全',
	subscription: '訂閱',
	system: '系統'
};

export const notificationTypeColors: Record<string, string> = {
	info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
	warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
	error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
	security: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
	subscription: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
	system: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
};
