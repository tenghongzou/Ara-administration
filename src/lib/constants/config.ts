export const config = {
	// API 配置
	apiHost: import.meta.env.VITE_API_HOST || 'http://localhost',
	apiVersion: import.meta.env.VITE_API_VERSION || 'v1',

	/** @deprecated 使用 apiHost + apiVersion 代替 */
	get apiBaseUrl(): string {
		return `${this.apiHost}/api/${this.apiVersion}`;
	},

	// WebSocket 配置
	wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws',

	// 應用程式配置
	appName: import.meta.env.VITE_APP_NAME || 'Admin Dashboard',
	appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

	// 環境配置
	isDev: import.meta.env.DEV,
	isProd: import.meta.env.PROD,
	isDebug: import.meta.env.VITE_DEBUG === 'true',
	isMockMode: import.meta.env.VITE_APP_ENV === 'demo_mock'
} as const;
