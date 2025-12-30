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
	isSystem: boolean; // 是否為系統內建角色（不可刪除）
	userCount?: number; // 使用此角色的用戶數
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoleData {
	key: string;
	label: string;
	description: string;
	color?: string;
	permissions: string[];
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

// 審計日誌
export interface AuditLog {
	id: string;
	userId: string;
	action: string;
	resource: string;
	resourceId: string;
	details: Record<string, unknown>;
	ipAddress: string;
	userAgent: string;
	createdAt: string;
}

// 訂閱管理相關
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type ServiceCategory = 'streaming' | 'music' | 'cloud' | 'productivity' | 'gaming' | 'other';
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
	paymentMethod?: PaymentMethod;
	autoRenew: boolean;
	reminderDays?: number;
	startDate: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaymentHistory {
	id: string;
	subscriptionId: string;
	amount: number;
	currency: string;
	paidAt: string;
	status: 'paid' | 'failed' | 'pending';
	note?: string;
	createdAt: string;
}

export interface CreateSubscriptionData {
	name: string;
	category: ServiceCategory;
	cost: number;
	currency?: string;
	billingCycle: BillingCycle;
	nextBillingDate: string;
	status?: SubscriptionStatus;
	description?: string;
	website?: string;
	accountEmail?: string;
	paymentMethod?: PaymentMethod;
	autoRenew?: boolean;
	reminderDays?: number;
	startDate?: string;
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
	description?: string;
	website?: string;
	accountEmail?: string;
	paymentMethod?: PaymentMethod;
	autoRenew?: boolean;
	reminderDays?: number;
}

export interface SubscriptionFilters {
	search?: string;
	category?: ServiceCategory;
	status?: SubscriptionStatus;
	billingCycle?: BillingCycle;
}

export interface SubscriptionStats {
	totalMonthly: Record<string, number>;
	totalYearly: Record<string, number>;
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

// 通知項目
export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	link?: string;
	read: boolean;
	createdAt: string;
}

export type NotificationType =
	| 'security'
	| 'system'
	| 'subscription'
	| 'user'
	| 'info';
