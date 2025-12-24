/**
 * Session 服務
 * 負責登入裝置管理的業務邏輯
 */

import { securityApi } from '$lib/services';
import type { LoginSession } from '$lib/types';
import type { DeviceInfo } from '../types';

class SessionService {
	/**
	 * 取得登入裝置列表
	 */
	async getSessions(userId: string): Promise<LoginSession[]> {
		return securityApi.getSessions(userId);
	}

	/**
	 * 登出指定裝置
	 */
	async revokeSession(sessionId: string): Promise<void> {
		return securityApi.revokeSession(sessionId);
	}

	/**
	 * 登出所有其他裝置
	 */
	async revokeAllOtherSessions(userId: string): Promise<number> {
		return securityApi.revokeAllOtherSessions(userId);
	}

	/**
	 * 格式化最後活動時間
	 */
	formatLastActive(dateStr: string, isCurrent: boolean): string {
		if (isCurrent) return '目前使用中';

		const date = new Date(dateStr);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return '剛剛';
		if (minutes < 60) return `${minutes} 分鐘前`;
		if (hours < 24) return `${hours} 小時前`;
		if (days < 30) return `${days} 天前`;
		return date.toLocaleDateString('zh-TW');
	}

	/**
	 * 取得裝置類型和圖示
	 */
	getDeviceInfo(device: string): DeviceInfo {
		const deviceLower = device.toLowerCase();

		if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
			return {
				type: 'mobile',
				icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />'
			};
		}

		if (deviceLower.includes('tablet')) {
			return {
				type: 'tablet',
				icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />'
			};
		}

		return {
			type: 'desktop',
			icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />'
		};
	}

	/**
	 * 取得裝置位置描述
	 */
	getLocationDescription(session: LoginSession): string {
		return `${session.os} · ${session.location} · ${this.formatLastActive(session.lastActiveAt, session.isCurrent)}`;
	}
}

export const sessionService = new SessionService();
