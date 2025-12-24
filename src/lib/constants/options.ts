import type { SelectOption } from '$lib/types';

// ==================== 使用者相關選項 ====================

export const roleOptions: SelectOption[] = [
	{ value: '', label: '全部角色' },
	{ value: 'admin', label: '系統管理員' },
	{ value: 'manager', label: '經理' },
	{ value: 'editor', label: '編輯' },
	{ value: 'viewer', label: '觀察員' }
];

export const roleOptionsWithoutAll: SelectOption[] = [
	{ value: 'admin', label: '系統管理員' },
	{ value: 'manager', label: '經理' },
	{ value: 'editor', label: '編輯' },
	{ value: 'viewer', label: '觀察員' }
];

export const userStatusOptions: SelectOption[] = [
	{ value: '', label: '全部狀態' },
	{ value: 'active', label: '啟用' },
	{ value: 'inactive', label: '停用' },
	{ value: 'pending', label: '待審核' },
	{ value: 'suspended', label: '已停權' }
];

export const userStatusOptionsWithoutAll: SelectOption[] = [
	{ value: 'active', label: '啟用' },
	{ value: 'inactive', label: '停用' },
	{ value: 'pending', label: '待審核' },
	{ value: 'suspended', label: '已停權' }
];

// ==================== 訂閱相關選項 ====================

export const categoryOptions: SelectOption[] = [
	{ value: '', label: '全部分類' },
	{ value: 'streaming', label: '影音串流' },
	{ value: 'music', label: '音樂' },
	{ value: 'cloud', label: '雲端儲存' },
	{ value: 'productivity', label: '生產力工具' },
	{ value: 'gaming', label: '遊戲' },
	{ value: 'other', label: '其他' }
];

export const categoryOptionsWithoutAll: SelectOption[] = [
	{ value: 'streaming', label: '影音串流' },
	{ value: 'music', label: '音樂' },
	{ value: 'cloud', label: '雲端儲存' },
	{ value: 'productivity', label: '生產力工具' },
	{ value: 'gaming', label: '遊戲' },
	{ value: 'other', label: '其他' }
];

export const subscriptionStatusOptions: SelectOption[] = [
	{ value: '', label: '全部狀態' },
	{ value: 'active', label: '啟用中' },
	{ value: 'paused', label: '已暫停' },
	{ value: 'cancelled', label: '已取消' },
	{ value: 'expired', label: '已過期' }
];

export const subscriptionStatusOptionsWithoutAll: SelectOption[] = [
	{ value: 'active', label: '啟用中' },
	{ value: 'paused', label: '已暫停' },
	{ value: 'cancelled', label: '已取消' },
	{ value: 'expired', label: '已過期' }
];

export const billingCycleOptions: SelectOption[] = [
	{ value: '', label: '全部週期' },
	{ value: 'weekly', label: '週繳' },
	{ value: 'monthly', label: '月繳' },
	{ value: 'quarterly', label: '季繳' },
	{ value: 'semi-annual', label: '半年繳' },
	{ value: 'annual', label: '年繳' }
];

export const billingCycleOptionsWithoutAll: SelectOption[] = [
	{ value: 'weekly', label: '週繳' },
	{ value: 'monthly', label: '月繳' },
	{ value: 'quarterly', label: '季繳' },
	{ value: 'semi-annual', label: '半年繳' },
	{ value: 'annual', label: '年繳' }
];

export const paymentMethodOptions: SelectOption[] = [
	{ value: '', label: '選擇付款方式' },
	{ value: 'credit_card', label: '信用卡' },
	{ value: 'debit_card', label: '金融卡' },
	{ value: 'bank_transfer', label: '銀行轉帳' },
	{ value: 'paypal', label: 'PayPal' },
	{ value: 'other', label: '其他' }
];

export const currencyOptions: SelectOption[] = [
	{ value: 'TWD', label: 'TWD (新台幣)' },
	{ value: 'USD', label: 'USD (美元)' },
	{ value: 'EUR', label: 'EUR (歐元)' },
	{ value: 'JPY', label: 'JPY (日圓)' },
	{ value: 'CNY', label: 'CNY (人民幣)' }
];

// ==================== 審計日誌相關選項 ====================

export const auditActionOptions: SelectOption[] = [
	{ value: '', label: '全部動作' },
	{ value: 'LOGIN', label: '登入' },
	{ value: 'LOGOUT', label: '登出' },
	{ value: 'CREATE', label: '新增' },
	{ value: 'UPDATE', label: '修改' },
	{ value: 'DELETE', label: '刪除' },
	{ value: 'EXPORT', label: '匯出' },
	{ value: 'IMPORT', label: '匯入' },
	{ value: 'DEPLOY', label: '部署' }
];

export const auditResourceOptions: SelectOption[] = [
	{ value: '', label: '全部資源' },
	{ value: 'auth', label: '身份驗證' },
	{ value: 'user', label: '使用者' },
	{ value: 'settings', label: '系統設定' },
	{ value: 'content', label: '內容管理' },
	{ value: 'system', label: '系統' },
	{ value: 'report', label: '報表' }
];

export const auditStatusOptions: SelectOption[] = [
	{ value: '', label: '全部結果' },
	{ value: 'success', label: '成功' },
	{ value: 'failure', label: '失敗' }
];

// ==================== 分頁相關選項 ====================

export const pageSizeOptions: SelectOption[] = [
	{ value: '10', label: '10 筆' },
	{ value: '20', label: '20 筆' },
	{ value: '50', label: '50 筆' },
	{ value: '100', label: '100 筆' }
];

// ==================== 提醒天數選項 ====================

export const reminderDaysOptions: SelectOption[] = [
	{ value: '0', label: '不提醒' },
	{ value: '1', label: '1 天前' },
	{ value: '3', label: '3 天前' },
	{ value: '5', label: '5 天前' },
	{ value: '7', label: '7 天前' },
	{ value: '14', label: '14 天前' },
	{ value: '30', label: '30 天前' }
];
