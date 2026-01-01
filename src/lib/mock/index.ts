/**
 * Mock Module
 *
 * Provides mock data and API implementations for demo mode.
 * Activated when VITE_APP_ENV=demo_mock
 */

// Re-export mock data
export * from './data';

// Re-export mock APIs
export * from './api';

/**
 * Check if the app is running in mock mode
 */
export const isMockMode = (): boolean => {
	return import.meta.env.VITE_APP_ENV === 'demo_mock';
};

/**
 * Helper to conditionally return mock or real implementation
 */
export function withMock<T>(mockImpl: T, realImpl: T): T {
	return isMockMode() ? mockImpl : realImpl;
}
