/**
 * Mock Data Re-exports
 *
 * This file re-exports mock data from the centralized mock folder
 * and provides backward-compatible label re-exports.
 *
 * The actual mock data is now in $lib/mock/data/
 * Mock APIs are in $lib/mock/api/
 */

// Re-export mock data from the centralized mock folder
export {
	mockUsers,
	mockDashboardStats,
	mockRecentActivities,
	mockAuditLogs,
	mockUserGrowthData,
	mockPageViewsData,
	mockUserDistribution,
	mockSubscriptions,
	mockPaymentHistory,
	mockRoles
} from '$lib/mock/data';

// Re-export labels from constants for backward compatibility
export {
	roleLabels,
	statusLabels,
	statusColors,
	actionLabels,
	resourceLabels,
	billingCycleLabels,
	subscriptionStatusLabels,
	subscriptionStatusColors,
	categoryLabels,
	categoryColors,
	paymentMethodLabels
} from '$lib/constants/labels';
