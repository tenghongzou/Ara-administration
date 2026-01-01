// Core utilities
export * from './core';

// Feature modules - APIs
export * from './auth';
export * from './users';
export * from './subscriptions';
export * from './roles';
export * from './logs';
export * from './dashboard';
export * from './notifications';

// Mock data (for testing and development) - selective exports to avoid type conflicts
export {
	mockUsers,
	mockRoles,
	mockDashboardStats,
	mockRecentActivities,
	mockPaymentHistory,
	mockUserGrowthData,
	mockPageViewsData,
	// Re-export labels for backwards compatibility
	billingCycleLabels,
	subscriptionStatusLabels,
	subscriptionStatusColors,
	categoryLabels,
	categoryColors,
	paymentMethodLabels,
	roleLabels,
	statusLabels
} from './mock-data';

// WebSocket service
export * from './websocket';

// Push notification service
export { pushNotificationService } from './push-notification';
