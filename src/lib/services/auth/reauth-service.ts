/**
 * Re-authentication Service
 * 處理 Token 過期時的重新驗證流程
 */
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface ReauthState {
	isOpen: boolean;
	isLoading: boolean;
	error: string | null;
	/** True once the backend has signalled the account needs a 2FA code. */
	needsTwoFactor: boolean;
}

interface PendingRequest<T = unknown> {
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
	retry: () => Promise<T>;
}

class ReauthService {
	private state = writable<ReauthState>({
		isOpen: false,
		isLoading: false,
		error: null,
		needsTwoFactor: false
	});

	private pendingRequests: PendingRequest[] = [];
	private isReauthenticating = false;

	subscribe = this.state.subscribe;

	/**
	 * 觸發重新驗證流程
	 */
	async triggerReauth<T>(retryFn: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.pendingRequests.push({
				resolve: resolve as (value: unknown) => void,
				reject,
				retry: retryFn
			});

			if (!this.isReauthenticating) {
				this.isReauthenticating = true;
				this.state.set({
					isOpen: true,
					isLoading: false,
					error: null,
					needsTwoFactor: false
				});
			}
		});
	}

	/**
	 * 提交密碼（及必要時的 2FA 驗證碼）進行重新驗證
	 */
	async submit(
		password: string,
		email: string,
		onSuccess: (token: string) => void,
		twoFactorCode?: string
	): Promise<void> {
		this.state.update((s) => ({ ...s, isLoading: true, error: null }));

		try {
			// 直接使用 fetch 避免循環依賴
			const response = await fetch('/api/v1/auth/reauth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password,
					...(twoFactorCode ? { twoFactorCode } : {})
				})
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				const code: string = body?.error?.code ?? '';
				const message: string = body?.error?.message ?? 'Invalid credentials';

				// 帳號啟用 2FA：切換到要求輸入驗證碼的狀態，而非視為失敗
				if (code === '2FA_REQUIRED') {
					this.state.update((s) => ({
						...s,
						isLoading: false,
						needsTwoFactor: true,
						error: null
					}));
					return;
				}

				if (code === '2FA_INVALID_CODE') {
					this.state.update((s) => ({
						...s,
						isLoading: false,
						needsTwoFactor: true,
						error: '驗證碼錯誤'
					}));
					return;
				}

				throw new Error(message);
			}

			const result = await response.json();
			const token = result.data?.token || result.token;

			if (!token) {
				throw new Error('No token received');
			}

			// 通知成功
			onSuccess(token);

			// 關閉彈窗
			this.state.set({ isOpen: false, isLoading: false, error: null, needsTwoFactor: false });
			this.isReauthenticating = false;

			// 重試所有等待中的請求
			await this.retryPendingRequests();
		} catch (error) {
			const message = error instanceof Error ? error.message : '驗證失敗';
			this.state.update((s) => ({
				...s,
				isLoading: false,
				error: message === 'Invalid credentials' ? '密碼錯誤' : message
			}));
		}
	}

	/**
	 * 取消重新驗證（用戶選擇登出）
	 */
	cancel(): void {
		this.state.set({ isOpen: false, isLoading: false, error: null, needsTwoFactor: false });
		this.isReauthenticating = false;

		this.pendingRequests.forEach(({ reject }) => {
			reject(new Error('Re-authentication cancelled'));
		});
		this.pendingRequests = [];
	}

	private async retryPendingRequests(): Promise<void> {
		const requests = [...this.pendingRequests];
		this.pendingRequests = [];

		for (const { resolve, reject, retry } of requests) {
			try {
				const result = await retry();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		}
	}

	/**
	 * 檢查錯誤是否為 Token 過期
	 */
	isTokenExpiredError(status: number, code?: string, message?: string): boolean {
		if (status !== 401) return false;

		const lowerCode = code?.toLowerCase() || '';
		const lowerMsg = message?.toLowerCase() || '';

		return (
			lowerCode.includes('expired') ||
			lowerCode === 'token_expired' ||
			lowerMsg.includes('expired') ||
			lowerMsg.includes('invalid token') ||
			lowerMsg.includes('jwt')
		);
	}
}

export const reauthService = new ReauthService();
