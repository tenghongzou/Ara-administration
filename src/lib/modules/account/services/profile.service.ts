/**
 * Profile 服務
 * 負責個人資料相關的業務邏輯
 */

import { authApi } from '$lib/services';
import type { User, UpdateProfileData } from '$lib/types';
import type { ProfileFormData } from '../types';

class ProfileService {
	/**
	 * 驗證個人資料表單
	 */
	validateForm(data: ProfileFormData): Record<string, string> {
		const errors: Record<string, string> = {};

		if (!data.name.trim()) {
			errors.name = '請輸入名稱';
		}

		if (!data.email.trim()) {
			errors.email = '請輸入電子郵件';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
			errors.email = '請輸入有效的電子郵件地址';
		}

		if (data.phone && !/^[0-9+\-\s()]+$/.test(data.phone)) {
			errors.phone = '請輸入有效的電話號碼';
		}

		if (data.bio && data.bio.length > 500) {
			errors.bio = '自我介紹不能超過 500 字元';
		}

		return errors;
	}

	/**
	 * 更新個人資料
	 */
	async updateProfile(userId: string, data: ProfileFormData): Promise<User> {
		const updateData: UpdateProfileData = {
			name: data.name,
			email: data.email,
			phone: data.phone || undefined,
			birthday: data.birthday || undefined,
			bio: data.bio || undefined
		};

		return authApi.updateProfile(userId, updateData);
	}

	/**
	 * 上傳頭像
	 */
	async uploadAvatar(userId: string, file: File): Promise<string> {
		// 驗證檔案類型
		if (!file.type.startsWith('image/')) {
			throw new Error('請選擇圖片檔案');
		}

		// 驗證檔案大小 (5MB)
		if (file.size > 5 * 1024 * 1024) {
			throw new Error('檔案大小不能超過 5MB');
		}

		return authApi.uploadAvatar(userId, file);
	}

	/**
	 * 移除頭像
	 */
	async removeAvatar(userId: string): Promise<void> {
		await authApi.updateProfile(userId, { avatar: '' });
	}

	/**
	 * 從使用者資料建立表單資料
	 */
	createFormData(user: User | null): ProfileFormData {
		if (!user) {
			return {
				name: '',
				email: '',
				phone: '',
				birthday: '',
				bio: '',
				avatar: ''
			};
		}

		return {
			name: user.name || '',
			email: user.email || '',
			phone: user.phone || '',
			birthday: user.birthday || '',
			bio: user.bio || '',
			avatar: user.avatar || ''
		};
	}

	/**
	 * 取得使用者姓名縮寫
	 */
	getInitials(name: string): string {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
}

export const profileService = new ProfileService();
