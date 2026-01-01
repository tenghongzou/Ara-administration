export const config = {
	apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
	appName: import.meta.env.VITE_APP_NAME || 'Admin Dashboard',
	appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
	isDev: import.meta.env.DEV,
	isProd: import.meta.env.PROD,
	isDebug: import.meta.env.VITE_DEBUG === 'true',
	isMockMode: import.meta.env.VITE_APP_ENV === 'demo_mock'
} as const;
