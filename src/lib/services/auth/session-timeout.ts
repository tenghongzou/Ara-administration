/**
 * Session Timeout 服務
 * 處理登入過期機制：閒置超時 + 絕對超時
 */

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { auth } from '$lib/stores/auth';

export interface SessionTimeoutConfig {
	/** 閒置超時時間（毫秒），預設 1 小時 */
	idleTimeout: number;
	/** 絕對超時時間（毫秒），預設 24 小時 */
	absoluteTimeout: number;
	/** 檢查間隔（毫秒），預設 30 秒 */
	checkInterval: number;
	/** 登出後跳轉路徑 */
	logoutRedirect: string;
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
	idleTimeout: 60 * 60 * 1000, // 1 小時
	absoluteTimeout: 24 * 60 * 60 * 1000, // 24 小時
	checkInterval: 30 * 1000, // 30 秒
	logoutRedirect: '/login'
};

const STORAGE_KEYS = {
	lastActivity: 'session_last_activity',
	loginTime: 'session_login_time'
};

class SessionTimeoutService {
	private config: SessionTimeoutConfig;
	private checkTimer: ReturnType<typeof setInterval> | null = null;
	private activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];

	constructor(config: Partial<SessionTimeoutConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	/**
	 * 啟動 session timeout 監控
	 */
	start(): void {
		if (!browser) return;

		// 初始化時間戳記
		this.initializeTimestamps();

		// 綁定活動事件
		this.bindActivityEvents();

		// 開始定期檢查
		this.startChecking();
	}

	/**
	 * 停止 session timeout 監控
	 */
	stop(): void {
		if (!browser) return;

		this.unbindActivityEvents();
		this.stopChecking();
	}

	/**
	 * 記錄登入時間（在登入成功時呼叫）
	 */
	recordLogin(): void {
		if (!browser) return;
		const now = Date.now();
		localStorage.setItem(STORAGE_KEYS.loginTime, now.toString());
		localStorage.setItem(STORAGE_KEYS.lastActivity, now.toString());
	}

	/**
	 * 清除 session 時間戳記（在登出時呼叫）
	 */
	clearTimestamps(): void {
		if (!browser) return;
		localStorage.removeItem(STORAGE_KEYS.loginTime);
		localStorage.removeItem(STORAGE_KEYS.lastActivity);
	}

	/**
	 * 取得剩餘時間資訊
	 */
	getRemainingTime(): { idle: number; absolute: number } | null {
		if (!browser) return null;

		const lastActivity = this.getLastActivity();
		const loginTime = this.getLoginTime();

		if (!lastActivity || !loginTime) return null;

		const now = Date.now();
		return {
			idle: Math.max(0, this.config.idleTimeout - (now - lastActivity)),
			absolute: Math.max(0, this.config.absoluteTimeout - (now - loginTime))
		};
	}

	private initializeTimestamps(): void {
		const loginTime = this.getLoginTime();
		if (!loginTime) {
			// 如果沒有登入時間，使用現在時間（相容舊的登入狀態）
			this.recordLogin();
		} else {
			// 更新最後活動時間
			this.updateLastActivity();
		}
	}

	private bindActivityEvents(): void {
		this.activityEvents.forEach((event) => {
			window.addEventListener(event, this.handleActivity, { passive: true });
		});
	}

	private unbindActivityEvents(): void {
		this.activityEvents.forEach((event) => {
			window.removeEventListener(event, this.handleActivity);
		});
	}

	private handleActivity = (): void => {
		this.updateLastActivity();
	};

	private updateLastActivity(): void {
		localStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());
	}

	private getLastActivity(): number | null {
		const value = localStorage.getItem(STORAGE_KEYS.lastActivity);
		return value ? parseInt(value, 10) : null;
	}

	private getLoginTime(): number | null {
		const value = localStorage.getItem(STORAGE_KEYS.loginTime);
		return value ? parseInt(value, 10) : null;
	}

	private startChecking(): void {
		this.checkTimer = setInterval(() => {
			this.checkTimeout();
		}, this.config.checkInterval);
	}

	private stopChecking(): void {
		if (this.checkTimer) {
			clearInterval(this.checkTimer);
			this.checkTimer = null;
		}
	}

	private checkTimeout(): void {
		const now = Date.now();
		const lastActivity = this.getLastActivity();
		const loginTime = this.getLoginTime();

		if (!lastActivity || !loginTime) return;

		// 檢查閒置超時
		const idleTime = now - lastActivity;
		if (idleTime >= this.config.idleTimeout) {
			this.handleSessionExpired('idle');
			return;
		}

		// 檢查絕對超時
		const sessionTime = now - loginTime;
		if (sessionTime >= this.config.absoluteTimeout) {
			this.handleSessionExpired('absolute');
			return;
		}
	}

	private handleSessionExpired(reason: 'idle' | 'absolute'): void {
		console.log(`Session expired: ${reason}`);

		// 停止監控
		this.stop();

		// 清除時間戳記
		this.clearTimestamps();

		// 登出
		auth.logout();

		// 跳轉到登入頁
		goto(this.config.logoutRedirect);
	}
}

// 匯出單例
export const sessionTimeout = new SessionTimeoutService();

// 匯出類別供自訂設定使用
export { SessionTimeoutService };
