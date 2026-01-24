// 使用者相關
export interface User {
	id: string;
	username: string;
	email: string;
	name: string;
	avatar?: string;
	role: UserRole;
	status: UserStatus;
	phone?: string;
	birthday?: string;
	bio?: string;
	createdAt: string;
	updatedAt: string;
	lastLoginAt?: string;
	// 安全相關
	passwordChangedAt?: string;
	twoFactorEnabled?: boolean;
	twoFactorSecret?: string;
	// 超級管理員（不可刪除）
	isSuperAdmin?: boolean;
}

// 登入裝置/Session
export interface LoginSession {
	id: string;
	userId: string;
	device: string;
	browser: string;
	os: string;
	ip: string;
	location: string;
	lastActiveAt: string;
	createdAt: string;
	isCurrent: boolean;
}

// 兩步驟驗證設定
export interface TwoFactorSetup {
	secret: string;
	qrCodeUrl: string;
	backupCodes: string[];
}

export interface UpdateProfileData {
	name?: string;
	email?: string;
	phone?: string;
	birthday?: string;
	bio?: string;
	avatar?: string;
}

export type UserRole = string; // 改為動態角色，允許自定義
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// 角色定義
export interface Role {
	id: string;
	key: string; // 唯一識別碼，用於程式邏輯
	label: string; // 顯示名稱
	description: string;
	color: string; // Tailwind CSS 顏色類別
	permissions: string[]; // 權限列表
	isSystem?: boolean; // 是否為系統內建角色（不可刪除）
	userCount?: number; // 使用此角色的用戶數
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoleData {
	key: string;
	label: string;
	description?: string;
	color?: string;
	permissions?: string[];
}

export interface UpdateRoleData {
	label?: string;
	description?: string;
	color?: string;
	permissions?: string[];
}

export interface CreateUserData {
	username: string;
	email: string;
	name: string;
	password: string;
	role: UserRole;
}

export interface UpdateUserData {
	username?: string;
	name?: string;
	email?: string;
	role?: UserRole;
	avatar?: string;
}

export interface UserFilters {
	search?: string;
	role?: UserRole;
	status?: UserStatus;
}

// 認證相關
export interface LoginCredentials {
	account: string; // 可以是 username 或 email
	password: string;
	rememberMe?: boolean;
}

export interface RegisterData {
	email: string;
	name: string;
	password: string;
	confirmPassword: string;
}

// 訂閱管理相關
// 後端支援的計費週期
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime' | 'custom';
// 後端支援的訂閱狀態
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'trial' | 'expired';
// 後端支援的服務分類
export type ServiceCategory =
	| 'streaming'
	| 'software'
	| 'gaming'
	| 'music'
	| 'news'
	| 'cloud'
	| 'productivity'
	| 'education'
	| 'fitness'
	| 'other';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'other';

export interface Subscription {
	id: string;
	name: string;
	logo?: string;
	category: ServiceCategory;
	cost: number;
	currency: string;
	billingCycle: BillingCycle;
	nextBillingDate: string;
	status: SubscriptionStatus;
	description?: string;
	website?: string;
	accountEmail?: string;
	paymentMethod?: string; // 後端使用 string，非限定型別
	autoRenew: boolean;
	reminderDays?: number;
	startDate: string;
	createdAt: string;
	updatedAt: string;
}

// 付款記錄 - 新增 refunded 狀態以匹配後端
export interface PaymentHistory {
	id: string;
	subscriptionId: string;
	amount: number;
	currency: string;
	paidAt: string;
	status: 'paid' | 'pending' | 'failed' | 'refunded';
	note?: string;
	createdAt: string;
}

export interface CreateSubscriptionData {
	name: string;
	cost: number;
	currency?: string;
	category?: ServiceCategory;
	billingCycle?: BillingCycle;
	nextBillingDate?: string;
	status?: SubscriptionStatus;
	description?: string;
	website?: string;
	accountEmail?: string;
	paymentMethod?: string;
	autoRenew?: boolean;
	reminderDays?: number;
	startDate?: string;
	logo?: string;
}

export interface UpdateSubscriptionData {
	name?: string;
	logo?: string;
	category?: ServiceCategory;
	cost?: number;
	currency?: string;
	billingCycle?: BillingCycle;
	nextBillingDate?: string;
	status?: SubscriptionStatus;
	description?: string | null;
	website?: string | null;
	accountEmail?: string | null;
	paymentMethod?: string | null;
	autoRenew?: boolean;
	reminderDays?: number | null;
	startDate?: string;
}

export interface SubscriptionFilters {
	search?: string;
	category?: ServiceCategory;
	status?: SubscriptionStatus;
	billingCycle?: BillingCycle;
}

export interface SubscriptionStats {
	totalMonthly: number;
	totalYearly: number;
	upcomingCount: number;
	activeCount: number;
}

// 通知設定
export interface NotificationSettings {
	email: EmailNotificationSettings;
	push: PushNotificationSettings;
	inApp: InAppNotificationSettings;
	quietHours: QuietHoursSettings;
}

export interface EmailNotificationSettings {
	enabled: boolean;
	securityAlerts: boolean;
	loginNotifications: boolean;
	systemUpdates: boolean;
	weeklyReport: boolean;
	subscriptionReminders: boolean;
	marketing: boolean;
}

export interface PushNotificationSettings {
	enabled: boolean;
	permission: 'granted' | 'denied' | 'default';
	securityAlerts: boolean;
	loginNotifications: boolean;
	systemAlerts: boolean;
	mentions: boolean;
	subscriptionReminders: boolean;
}

export interface InAppNotificationSettings {
	enabled: boolean;
	showBadge: boolean;
	playSound: boolean;
	desktopPopup: boolean;
	autoMarkRead: boolean;
}

export interface QuietHoursSettings {
	enabled: boolean;
	startTime: string; // HH:mm format
	endTime: string; // HH:mm format
	timezone: string;
	allowUrgent: boolean;
}

// 通知項目 - 更新以匹配後端結構
export interface Notification {
	id: string;
	userId?: string;
	type: NotificationType;
	eventType?: string;
	title: string;
	message: string;
	data?: Record<string, unknown> | null; // 後端使用 data 而非 payload
	payload?: Record<string, unknown> | null; // 保持向後兼容
	link?: string | null;
	read: boolean;
	priority?: NotificationPriority;
	source?: string | null;
	createdAt: string;
	readAt?: string | null;
}

// 後端支援的通知類型
export type NotificationType =
	| 'info'
	| 'success'
	| 'warning'
	| 'error'
	| 'security'
	| 'system'
	| 'subscription'
	| 'subscription_reminder'
	| 'payment'
	| 'marketing'
	| 'other';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// 通知統計 - 更新以匹配後端結構
export interface NotificationStatistics {
	total: number;
	unread: number;
	byType: Record<string, number>;
	thisWeek?: number;
	thisMonth?: number;
}

// 審計日誌 - 更新以匹配後端結構
export interface AuditLog {
	id: string;
	userId?: string | null;
	userName?: string | null;
	userEmail?: string | null;
	action: AuditLogAction;
	resource: string;
	resourceId?: string | null;
	description?: string | null;
	oldValues?: Record<string, unknown> | null;
	newValues?: Record<string, unknown> | null;
	metadata?: Record<string, unknown> | null;
	ipAddress?: string | null;
	userAgent?: string | null;
	status: 'success' | 'failure';
	errorMessage?: string | null;
	createdAt: string;
	// 後端在 /audit-logs 列表中包含 user 物件
	user?: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
	} | null;
}

export type AuditLogAction =
	| 'create'
	| 'update'
	| 'delete'
	| 'login'
	| 'logout'
	| 'view'
	| 'export'
	| 'import';

// 審計日誌統計 - 更新以匹配後端結構
export interface AuditLogStatistics {
	total: number;
	byAction: Record<string, number>;
	byResource: Record<string, number>;
	byStatus: Record<string, number>;
	byDay?: { date: string; count: number }[];
}

// 審計日誌篩選選項
export interface AuditLogFilters {
	actions: string[];
	resources: string[];
	statuses: string[];
}

// Dashboard 統計
export interface DashboardStats {
	users: {
		total: number;
		active: number;
		inactive: number;
		pending: number;
		suspended: number;
		newThisMonth: number;
		newLastMonth: number;
		growthPercentage: number;
	};
	subscriptions: {
		total: number;
		active: number;
		paused: number;
		cancelled: number;
		monthlySpending: number;
		yearlySpending: number;
		upcomingCount: number;
	};
	activity: {
		totalThisMonth: number;
		byAction: Record<string, number>;
		byResource: Record<string, number>;
		successRate: number;
	};
	generatedAt: string;
}

// Dashboard 活動項目
export interface DashboardActivity {
	id: string;
	type: string;
	action: string;
	resource: string;
	resourceId?: string | null;
	description: string;
	user?: {
		id: string;
		name: string;
		avatar?: string | null;
	} | null;
	status: string;
	createdAt: string;
}
