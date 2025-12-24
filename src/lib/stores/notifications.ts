import { writable, derived, get } from 'svelte/store';

export interface Notification {
	id: string;
	type: 'info' | 'success' | 'warning' | 'error';
	title: string;
	message: string;
	read: boolean;
	timestamp: string;
	link?: string;
	/** 來源：local (本地) | remote (WebSocket) */
	source?: 'local' | 'remote';
}

interface NotificationsState {
	items: Notification[];
	isOpen: boolean;
	/** 是否已從伺服器載入歷史通知 */
	initialized: boolean;
}

// 初始 mock 資料 (開發用)
const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: '1',
		type: 'info',
		title: '新使用者註冊',
		message: '陳待審 已提交註冊申請，等待審核',
		read: false,
		timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
		link: '/users',
		source: 'local'
	},
	{
		id: '2',
		type: 'warning',
		title: '系統更新提醒',
		message: '系統將於今晚 23:00 進行維護更新',
		read: false,
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
		source: 'local'
	},
	{
		id: '3',
		type: 'success',
		title: '備份完成',
		message: '每日自動備份已成功完成',
		read: true,
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
		source: 'local'
	},
	{
		id: '4',
		type: 'error',
		title: '登入異常',
		message: '偵測到多次登入失敗嘗試',
		read: true,
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
		link: '/logs',
		source: 'local'
	}
];

function createNotificationsStore() {
	const { subscribe, update, set } = writable<NotificationsState>({
		items: MOCK_NOTIFICATIONS,
		isOpen: false,
		initialized: false
	});

	return {
		subscribe,

		// UI 狀態管理
		toggle: () => {
			update((state) => ({ ...state, isOpen: !state.isOpen }));
		},

		open: () => {
			update((state) => ({ ...state, isOpen: true }));
		},

		close: () => {
			update((state) => ({ ...state, isOpen: false }));
		},

		// 通知操作
		markAsRead: (id: string) => {
			update((state) => ({
				...state,
				items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item))
			}));
		},

		markAllAsRead: () => {
			update((state) => ({
				...state,
				items: state.items.map((item) => ({ ...item, read: true }))
			}));
		},

		remove: (id: string) => {
			update((state) => ({
				...state,
				items: state.items.filter((item) => item.id !== id)
			}));
		},

		add: (
			notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
			options?: { source?: 'local' | 'remote' }
		) => {
			const newNotification: Notification = {
				...notification,
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString(),
				read: false,
				source: options?.source || 'local'
			};
			update((state) => ({
				...state,
				items: [newNotification, ...state.items]
			}));
			return newNotification;
		},

		clear: () => {
			update((state) => ({ ...state, items: [] }));
		},

		// WebSocket 整合方法
		/**
		 * 從伺服器載入歷史通知（批量設定）
		 */
		setItems: (items: Notification[]) => {
			update((state) => ({
				...state,
				items: items.map((item) => ({ ...item, source: 'remote' as const })),
				initialized: true
			}));
		},

		/**
		 * 追加多筆通知（保留現有）
		 */
		addItems: (items: Notification[]) => {
			update((state) => {
				const existingIds = new Set(state.items.map((item) => item.id));
				const newItems = items
					.filter((item) => !existingIds.has(item.id))
					.map((item) => ({ ...item, source: 'remote' as const }));
				return {
					...state,
					items: [...newItems, ...state.items]
				};
			});
		},

		/**
		 * 透過 ID 更新單筆通知
		 */
		updateItem: (id: string, updates: Partial<Notification>) => {
			update((state) => ({
				...state,
				items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item))
			}));
		},

		/**
		 * 重設為初始狀態
		 */
		reset: () => {
			set({
				items: MOCK_NOTIFICATIONS,
				isOpen: false,
				initialized: false
			});
		},

		/**
		 * 取得目前狀態快照
		 */
		getState: () => get({ subscribe })
	};
}

export const notifications = createNotificationsStore();

export const unreadCount = derived(
	notifications,
	($notifications) => $notifications.items.filter((n) => !n.read).length
);
