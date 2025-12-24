import type {
	User,
	UserRole,
	UserStatus,
	Subscription,
	PaymentHistory,
	BillingCycle,
	SubscriptionStatus,
	ServiceCategory,
	PaymentMethod,
	Role
} from '$lib/types';

export const mockUsers: User[] = [
	{
		id: '1',
		username: 'admin',
		email: 'admin@example.com',
		name: '系統管理員',
		role: 'admin',
		status: 'active',
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-12-01T00:00:00Z',
		lastLoginAt: '2024-12-20T10:30:00Z'
	},
	{
		id: '2',
		username: 'manager',
		email: 'manager@example.com',
		name: '王經理',
		role: 'manager',
		status: 'active',
		createdAt: '2024-02-15T00:00:00Z',
		updatedAt: '2024-11-20T00:00:00Z',
		lastLoginAt: '2024-12-19T14:20:00Z'
	},
	{
		id: '3',
		username: 'editor',
		email: 'editor@example.com',
		name: '李編輯',
		role: 'editor',
		status: 'active',
		createdAt: '2024-03-10T00:00:00Z',
		updatedAt: '2024-10-15T00:00:00Z',
		lastLoginAt: '2024-12-18T09:00:00Z'
	},
	{
		id: '4',
		username: 'viewer',
		email: 'viewer@example.com',
		name: '張觀察員',
		role: 'viewer',
		status: 'inactive',
		createdAt: '2024-04-20T00:00:00Z',
		updatedAt: '2024-09-01T00:00:00Z'
	},
	{
		id: '5',
		username: 'pending_user',
		email: 'pending@example.com',
		name: '陳待審',
		role: 'viewer',
		status: 'pending',
		createdAt: '2024-12-01T00:00:00Z',
		updatedAt: '2024-12-01T00:00:00Z'
	},
	{
		id: '6',
		username: 'suspended_user',
		email: 'suspended@example.com',
		name: '林停權',
		role: 'editor',
		status: 'suspended',
		createdAt: '2024-05-10T00:00:00Z',
		updatedAt: '2024-11-30T00:00:00Z'
	},
	{
		id: '7',
		username: 'developer',
		email: 'developer@example.com',
		name: '黃開發',
		role: 'editor',
		status: 'active',
		createdAt: '2024-06-01T00:00:00Z',
		updatedAt: '2024-12-15T00:00:00Z',
		lastLoginAt: '2024-12-20T08:00:00Z'
	},
	{
		id: '8',
		username: 'designer',
		email: 'designer@example.com',
		name: '吳設計',
		role: 'editor',
		status: 'active',
		createdAt: '2024-07-15T00:00:00Z',
		updatedAt: '2024-12-10T00:00:00Z',
		lastLoginAt: '2024-12-19T16:30:00Z'
	}
];

export const mockDashboardStats = {
	totalUsers: 1234,
	activeUsers: 892,
	newUsersThisMonth: 56,
	revenue: 125000,
	revenueChange: 12.5,
	activeUsersChange: 8.3,
	newUsersChange: -5.2,
	pageViews: 45678,
	pageViewsChange: 15.8
};

export const mockRecentActivities = [
	{
		id: '1',
		user: '王經理',
		action: '新增使用者',
		target: '李小明',
		timestamp: '2024-12-20T10:30:00Z'
	},
	{
		id: '2',
		user: '系統管理員',
		action: '修改設定',
		target: '系統通知設定',
		timestamp: '2024-12-20T09:15:00Z'
	},
	{
		id: '3',
		user: '李編輯',
		action: '更新內容',
		target: '首頁橫幅',
		timestamp: '2024-12-19T16:45:00Z'
	},
	{
		id: '4',
		user: '系統管理員',
		action: '停權使用者',
		target: '林停權',
		timestamp: '2024-12-19T14:20:00Z'
	},
	{
		id: '5',
		user: '黃開發',
		action: '部署更新',
		target: 'v2.1.0',
		timestamp: '2024-12-18T11:00:00Z'
	}
];

// Re-export labels from constants for backward compatibility
export {
	roleLabels,
	statusLabels,
	statusColors
} from '$lib/constants/labels';

export interface AuditLog {
	id: string;
	userId: string;
	userName: string;
	action: string;
	resource: string;
	resourceId?: string;
	details?: string;
	ip: string;
	userAgent: string;
	status: 'success' | 'failure';
	timestamp: string;
}

export const mockAuditLogs: AuditLog[] = [
	{
		id: '1',
		userId: '1',
		userName: '系統管理員',
		action: 'LOGIN',
		resource: 'auth',
		details: '登入成功',
		ip: '192.168.1.100',
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
	},
	{
		id: '2',
		userId: '2',
		userName: '王經理',
		action: 'CREATE',
		resource: 'user',
		resourceId: '8',
		details: '新增使用者：吳設計',
		ip: '192.168.1.101',
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
	},
	{
		id: '3',
		userId: '1',
		userName: '系統管理員',
		action: 'UPDATE',
		resource: 'settings',
		details: '修改系統通知設定',
		ip: '192.168.1.100',
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
	},
	{
		id: '4',
		userId: '3',
		userName: '李編輯',
		action: 'UPDATE',
		resource: 'content',
		resourceId: 'banner-1',
		details: '更新首頁橫幅',
		ip: '192.168.1.102',
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
	},
	{
		id: '5',
		userId: '1',
		userName: '系統管理員',
		action: 'UPDATE',
		resource: 'user',
		resourceId: '6',
		details: '停權使用者：林停權',
		ip: '192.168.1.100',
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
	},
	{
		id: '6',
		userId: '7',
		userName: '黃開發',
		action: 'DEPLOY',
		resource: 'system',
		details: '部署版本 v2.1.0',
		ip: '192.168.1.103',
		userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
	},
	{
		id: '7',
		userId: 'unknown',
		userName: '未知',
		action: 'LOGIN',
		resource: 'auth',
		details: '登入失敗：密碼錯誤',
		ip: '203.0.113.50',
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
		status: 'failure',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
	},
	{
		id: '8',
		userId: '2',
		userName: '王經理',
		action: 'DELETE',
		resource: 'user',
		resourceId: '10',
		details: '刪除使用者：測試帳號',
		ip: '192.168.1.101',
		userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
	},
	{
		id: '9',
		userId: '1',
		userName: '系統管理員',
		action: 'EXPORT',
		resource: 'report',
		details: '匯出使用者報表',
		ip: '192.168.1.100',
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
		status: 'success',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
	},
	{
		id: '10',
		userId: 'unknown',
		userName: '未知',
		action: 'LOGIN',
		resource: 'auth',
		details: '登入失敗：帳號不存在',
		ip: '198.51.100.25',
		userAgent: 'curl/7.68.0',
		status: 'failure',
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
	}
];

// Re-export audit labels from constants
export { actionLabels, resourceLabels } from '$lib/constants/labels';

// Chart data
export const mockUserGrowthData = [
	{ label: '7月', value: 820 },
	{ label: '8月', value: 932 },
	{ label: '9月', value: 901 },
	{ label: '10月', value: 1034 },
	{ label: '11月', value: 1120 },
	{ label: '12月', value: 1234 }
];

export const mockPageViewsData = [
	{ label: '週一', value: 5200 },
	{ label: '週二', value: 6800 },
	{ label: '週三', value: 7200 },
	{ label: '週四', value: 6100 },
	{ label: '週五', value: 8900 },
	{ label: '週六', value: 4500 },
	{ label: '週日', value: 3800 }
];

export const mockUserDistribution = [
	{ label: '管理員', value: 12 },
	{ label: '經理', value: 45 },
	{ label: '編輯', value: 234 },
	{ label: '觀察員', value: 943 }
];

// 訂閱管理相關
export const mockSubscriptions: Subscription[] = [
	{
		id: '1',
		name: 'Netflix',
		category: 'streaming',
		cost: 390,
		currency: 'TWD',
		billingCycle: 'monthly',
		nextBillingDate: '2025-01-15',
		status: 'active',
		description: '高級方案，4K畫質',
		website: 'https://www.netflix.com',
		accountEmail: 'user@example.com',
		paymentMethod: 'credit_card',
		autoRenew: true,
		reminderDays: 3,
		startDate: '2023-06-01',
		createdAt: '2023-06-01T00:00:00Z',
		updatedAt: '2024-12-01T00:00:00Z'
	},
	{
		id: '2',
		name: 'Spotify',
		category: 'music',
		cost: 149,
		currency: 'TWD',
		billingCycle: 'monthly',
		nextBillingDate: '2025-01-20',
		status: 'active',
		description: 'Premium 個人方案',
		website: 'https://www.spotify.com',
		accountEmail: 'user@example.com',
		paymentMethod: 'credit_card',
		autoRenew: true,
		reminderDays: 3,
		startDate: '2022-03-15',
		createdAt: '2022-03-15T00:00:00Z',
		updatedAt: '2024-11-20T00:00:00Z'
	},
	{
		id: '3',
		name: 'YouTube Premium',
		category: 'streaming',
		cost: 179,
		currency: 'TWD',
		billingCycle: 'monthly',
		nextBillingDate: '2025-01-10',
		status: 'active',
		description: '無廣告觀看',
		website: 'https://www.youtube.com/premium',
		paymentMethod: 'credit_card',
		autoRenew: true,
		startDate: '2024-01-10',
		createdAt: '2024-01-10T00:00:00Z',
		updatedAt: '2024-12-10T00:00:00Z'
	},
	{
		id: '4',
		name: 'iCloud+',
		category: 'cloud',
		cost: 90,
		currency: 'TWD',
		billingCycle: 'monthly',
		nextBillingDate: '2025-01-05',
		status: 'active',
		description: '200GB 儲存空間',
		website: 'https://www.icloud.com',
		paymentMethod: 'credit_card',
		autoRenew: true,
		startDate: '2023-01-05',
		createdAt: '2023-01-05T00:00:00Z',
		updatedAt: '2024-12-05T00:00:00Z'
	},
	{
		id: '5',
		name: 'Microsoft 365',
		category: 'productivity',
		cost: 2190,
		currency: 'TWD',
		billingCycle: 'annual',
		nextBillingDate: '2025-06-01',
		status: 'active',
		description: '家用版，最多6人使用',
		website: 'https://www.microsoft.com/microsoft-365',
		accountEmail: 'user@outlook.com',
		paymentMethod: 'credit_card',
		autoRenew: true,
		reminderDays: 7,
		startDate: '2024-06-01',
		createdAt: '2024-06-01T00:00:00Z',
		updatedAt: '2024-06-01T00:00:00Z'
	},
	{
		id: '6',
		name: 'Disney+',
		category: 'streaming',
		cost: 270,
		currency: 'TWD',
		billingCycle: 'monthly',
		nextBillingDate: '2025-01-25',
		status: 'paused',
		description: '暫停訂閱中',
		website: 'https://www.disneyplus.com',
		paymentMethod: 'credit_card',
		autoRenew: false,
		startDate: '2023-11-25',
		createdAt: '2023-11-25T00:00:00Z',
		updatedAt: '2024-10-25T00:00:00Z'
	},
	{
		id: '7',
		name: 'Xbox Game Pass',
		category: 'gaming',
		cost: 449,
		currency: 'TWD',
		billingCycle: 'monthly',
		nextBillingDate: '2025-01-18',
		status: 'active',
		description: 'Ultimate 方案',
		website: 'https://www.xbox.com/gamepass',
		paymentMethod: 'paypal',
		autoRenew: true,
		startDate: '2024-03-18',
		createdAt: '2024-03-18T00:00:00Z',
		updatedAt: '2024-12-18T00:00:00Z'
	},
	{
		id: '8',
		name: 'Adobe Creative Cloud',
		category: 'productivity',
		cost: 1680,
		currency: 'TWD',
		billingCycle: 'monthly',
		nextBillingDate: '2025-01-01',
		status: 'active',
		description: '攝影計畫 (PS+LR)',
		website: 'https://www.adobe.com',
		accountEmail: 'user@example.com',
		paymentMethod: 'credit_card',
		autoRenew: true,
		reminderDays: 5,
		startDate: '2022-01-01',
		createdAt: '2022-01-01T00:00:00Z',
		updatedAt: '2024-12-01T00:00:00Z'
	},
	{
		id: '9',
		name: 'Nintendo Switch Online',
		category: 'gaming',
		cost: 800,
		currency: 'TWD',
		billingCycle: 'annual',
		nextBillingDate: '2025-09-15',
		status: 'active',
		description: '家庭會員資格',
		website: 'https://www.nintendo.com',
		paymentMethod: 'credit_card',
		autoRenew: true,
		startDate: '2024-09-15',
		createdAt: '2024-09-15T00:00:00Z',
		updatedAt: '2024-09-15T00:00:00Z'
	},
	{
		id: '10',
		name: 'Dropbox Plus',
		category: 'cloud',
		cost: 3588,
		currency: 'TWD',
		billingCycle: 'annual',
		nextBillingDate: '2025-04-10',
		status: 'cancelled',
		description: '2TB 儲存空間 (已取消)',
		website: 'https://www.dropbox.com',
		paymentMethod: 'credit_card',
		autoRenew: false,
		startDate: '2023-04-10',
		createdAt: '2023-04-10T00:00:00Z',
		updatedAt: '2024-11-10T00:00:00Z'
	}
];

export const mockPaymentHistory: PaymentHistory[] = [
	{
		id: '1',
		subscriptionId: '1',
		amount: 390,
		currency: 'TWD',
		paidAt: '2024-12-15T00:00:00Z',
		status: 'paid'
	},
	{
		id: '2',
		subscriptionId: '1',
		amount: 390,
		currency: 'TWD',
		paidAt: '2024-11-15T00:00:00Z',
		status: 'paid'
	},
	{
		id: '3',
		subscriptionId: '1',
		amount: 390,
		currency: 'TWD',
		paidAt: '2024-10-15T00:00:00Z',
		status: 'paid'
	},
	{
		id: '4',
		subscriptionId: '2',
		amount: 149,
		currency: 'TWD',
		paidAt: '2024-12-20T00:00:00Z',
		status: 'paid'
	},
	{
		id: '5',
		subscriptionId: '2',
		amount: 149,
		currency: 'TWD',
		paidAt: '2024-11-20T00:00:00Z',
		status: 'paid'
	},
	{
		id: '6',
		subscriptionId: '8',
		amount: 1680,
		currency: 'TWD',
		paidAt: '2024-12-01T00:00:00Z',
		status: 'paid'
	},
	{
		id: '7',
		subscriptionId: '8',
		amount: 1680,
		currency: 'TWD',
		paidAt: '2024-11-01T00:00:00Z',
		status: 'paid'
	}
];

// Re-export subscription labels from constants
export {
	billingCycleLabels,
	subscriptionStatusLabels,
	subscriptionStatusColors,
	categoryLabels,
	categoryColors,
	paymentMethodLabels
} from '$lib/constants/labels';

// 角色資料
export const mockRoles: Role[] = [
	{
		id: '1',
		key: 'admin',
		label: '系統管理員',
		description: '擁有系統所有權限，可管理所有資源',
		color: 'red',
		permissions: ['*'],
		isSystem: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: '2',
		key: 'manager',
		label: '經理',
		description: '可管理使用者與訂閱，查看日誌',
		color: 'blue',
		permissions: [
			'users:read',
			'users:create',
			'users:update',
			'roles:read',
			'subscriptions:read',
			'subscriptions:create',
			'subscriptions:update',
			'subscriptions:delete',
			'settings:read',
			'logs:read',
			'export:data'
		],
		isSystem: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: '3',
		key: 'editor',
		label: '編輯',
		description: '可新增與編輯訂閱，匯出資料',
		color: 'green',
		permissions: [
			'subscriptions:read',
			'subscriptions:create',
			'subscriptions:update',
			'settings:read',
			'export:data'
		],
		isSystem: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: '4',
		key: 'viewer',
		label: '觀察員',
		description: '只能查看訂閱資料',
		color: 'gray',
		permissions: ['subscriptions:read', 'settings:read'],
		isSystem: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	}
];
