export const config = {
	// API 配置
	apiHost: import.meta.env.VITE_API_HOST || '',
	apiVersion: import.meta.env.VITE_API_VERSION || 'v1',

	/** @deprecated 使用 apiHost + apiVersion 代替 */
	get apiBaseUrl(): string {
		return `${this.apiHost}/api/${this.apiVersion}`;
	},

	// WebSocket 配置(通知服務)
	wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws',

	// 聊天服務(Rust)：走 /chat 前綴(dev = Vite proxy,prod = Caddy handle_path),
	// 兩者都會 strip /chat 後轉發到 chat:8082。相對路徑 = 同源,免 CORS。
	chatApiUrl: import.meta.env.VITE_CHAT_API_URL || '/chat/api/v1',
	chatWsUrl: import.meta.env.VITE_CHAT_WS_URL || '/chat/ws',

	// 應用程式配置
	appName: import.meta.env.VITE_APP_NAME || 'Admin Dashboard',
	appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

	// 環境配置
	isDev: import.meta.env.DEV,
	isProd: import.meta.env.PROD,
	isDebug: import.meta.env.VITE_DEBUG === 'true',
	isMockMode: import.meta.env.VITE_APP_ENV === 'demo_mock'
} as const;
