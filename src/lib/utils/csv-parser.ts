import Papa from 'papaparse';
import type { CreateSubscriptionData, ServiceCategory, BillingCycle, PaymentMethod } from '$lib/types';

export interface ParsedRow {
	[key: string]: string;
}

export interface ParseResult {
	data: ParsedRow[];
	headers: string[];
	errors: { row: number; message: string }[];
}

export interface FieldMapping {
	name: string | null;
	category: string | null;
	cost: string | null;
	currency: string | null;
	billingCycle: string | null;
	nextBillingDate: string | null;
	status: string | null;
	description: string | null;
	website: string | null;
	accountEmail: string | null;
	paymentMethod: string | null;
	autoRenew: string | null;
	reminderDays: string | null;
}

export interface ValidationError {
	row: number;
	field: string;
	message: string;
}

export interface MappedSubscription {
	data: CreateSubscriptionData;
	row: number;
	errors: ValidationError[];
	warnings: string[];
}

/**
 * 解析 CSV 檔案
 */
export function parseCSV(file: File): Promise<ParseResult> {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const headers = results.meta.fields || [];
				const data = results.data as ParsedRow[];
				const errors = results.errors.map((e) => ({
					row: e.row || 0,
					message: e.message
				}));
				resolve({ data, headers, errors });
			},
			error: (error) => {
				reject(new Error(`CSV 解析失敗: ${error.message}`));
			}
		});
	});
}

/**
 * 自動偵測欄位對應
 */
export function autoDetectMapping(headers: string[]): FieldMapping {
	const mapping: FieldMapping = {
		name: null,
		category: null,
		cost: null,
		currency: null,
		billingCycle: null,
		nextBillingDate: null,
		status: null,
		description: null,
		website: null,
		accountEmail: null,
		paymentMethod: null,
		autoRenew: null,
		reminderDays: null
	};

	const patterns: Record<keyof FieldMapping, RegExp[]> = {
		name: [/name|名稱|服務名|訂閱名/i],
		category: [/category|分類|類別|類型/i],
		cost: [/cost|price|amount|費用|金額|價格/i],
		currency: [/currency|幣別|貨幣/i],
		billingCycle: [/cycle|billing|週期|計費|周期/i],
		nextBillingDate: [/next|billing.*date|下次|扣款日|到期/i],
		status: [/status|狀態/i],
		description: [/description|desc|描述|說明|備註/i],
		website: [/website|url|網址|網站/i],
		accountEmail: [/email|帳號|信箱/i],
		paymentMethod: [/payment|付款|支付/i],
		autoRenew: [/auto.*renew|自動.*續/i],
		reminderDays: [/reminder|提醒/i]
	};

	for (const header of headers) {
		for (const [field, regexes] of Object.entries(patterns)) {
			if (mapping[field as keyof FieldMapping] === null) {
				for (const regex of regexes) {
					if (regex.test(header)) {
						mapping[field as keyof FieldMapping] = header;
						break;
					}
				}
			}
		}
	}

	return mapping;
}

/**
 * 驗證並轉換資料
 */
export function mapAndValidateData(
	data: ParsedRow[],
	mapping: FieldMapping
): MappedSubscription[] {
	const results: MappedSubscription[] = [];

	for (let i = 0; i < data.length; i++) {
		const row = data[i];
		const errors: ValidationError[] = [];
		const warnings: string[] = [];

		// 必填欄位
		const name = mapping.name ? row[mapping.name]?.trim() : '';
		if (!name) {
			errors.push({ row: i + 1, field: 'name', message: '服務名稱為必填' });
		}

		const costStr = mapping.cost ? row[mapping.cost]?.trim() : '';
		const cost = parseFloat(costStr);
		if (!costStr || isNaN(cost) || cost <= 0) {
			errors.push({ row: i + 1, field: 'cost', message: '費用必須是大於 0 的數字' });
		}

		const nextBillingDate = mapping.nextBillingDate ? row[mapping.nextBillingDate]?.trim() : '';
		if (!nextBillingDate) {
			errors.push({ row: i + 1, field: 'nextBillingDate', message: '下次扣款日為必填' });
		} else if (!/^\d{4}-\d{2}-\d{2}/.test(nextBillingDate)) {
			errors.push({ row: i + 1, field: 'nextBillingDate', message: '日期格式應為 YYYY-MM-DD' });
		}

		// 可選欄位轉換
		const category = parseCategory(mapping.category ? row[mapping.category] : '');
		const billingCycle = parseBillingCycle(mapping.billingCycle ? row[mapping.billingCycle] : '');
		const paymentMethod = parsePaymentMethod(mapping.paymentMethod ? row[mapping.paymentMethod] : '');
		const autoRenew = parseBoolean(mapping.autoRenew ? row[mapping.autoRenew] : '');
		const reminderDays = parseInt(mapping.reminderDays ? row[mapping.reminderDays] : '3') || 3;

		if (mapping.category && row[mapping.category] && !category) {
			warnings.push(`分類 "${row[mapping.category]}" 無法識別，已設為「其他」`);
		}

		const subscription: CreateSubscriptionData = {
			name: name || '未命名訂閱',
			category: category || 'other',
			cost: isNaN(cost) ? 0 : cost,
			currency: mapping.currency ? row[mapping.currency]?.trim() || 'TWD' : 'TWD',
			billingCycle: billingCycle || 'monthly',
			nextBillingDate: nextBillingDate || new Date().toISOString().split('T')[0],
			status: 'active',
			description: mapping.description ? row[mapping.description]?.trim() : undefined,
			website: mapping.website ? row[mapping.website]?.trim() : undefined,
			accountEmail: mapping.accountEmail ? row[mapping.accountEmail]?.trim() : undefined,
			paymentMethod: paymentMethod,
			autoRenew: autoRenew ?? true,
			reminderDays
		};

		results.push({ data: subscription, row: i + 1, errors, warnings });
	}

	return results;
}

function parseCategory(value: string): ServiceCategory | null {
	const normalized = value?.toLowerCase().trim();
	const map: Record<string, ServiceCategory> = {
		streaming: 'streaming',
		'影音串流': 'streaming',
		'影音': 'streaming',
		'串流': 'streaming',
		music: 'music',
		'音樂': 'music',
		cloud: 'cloud',
		'雲端': 'cloud',
		'雲端儲存': 'cloud',
		productivity: 'productivity',
		'生產力': 'productivity',
		'工具': 'productivity',
		gaming: 'gaming',
		'遊戲': 'gaming',
		other: 'other',
		'其他': 'other'
	};
	return map[normalized] || null;
}

function parseBillingCycle(value: string): BillingCycle | null {
	const normalized = value?.toLowerCase().trim();
	const map: Record<string, BillingCycle> = {
		weekly: 'weekly',
		'週繳': 'weekly',
		'每週': 'weekly',
		monthly: 'monthly',
		'月繳': 'monthly',
		'每月': 'monthly',
		quarterly: 'quarterly',
		'季繳': 'quarterly',
		'每季': 'quarterly',
		'semi-annual': 'semi-annual',
		'半年繳': 'semi-annual',
		'每半年': 'semi-annual',
		annual: 'annual',
		'年繳': 'annual',
		'每年': 'annual'
	};
	return map[normalized] || null;
}

function parsePaymentMethod(value: string): PaymentMethod | undefined {
	const normalized = value?.toLowerCase().trim();
	const map: Record<string, PaymentMethod> = {
		credit_card: 'credit_card',
		'信用卡': 'credit_card',
		debit_card: 'debit_card',
		'金融卡': 'debit_card',
		bank_transfer: 'bank_transfer',
		'銀行轉帳': 'bank_transfer',
		paypal: 'paypal',
		other: 'other',
		'其他': 'other'
	};
	return map[normalized];
}

function parseBoolean(value: string): boolean | null {
	const normalized = value?.toLowerCase().trim();
	if (['true', 'yes', '1', '是', '啟用'].includes(normalized)) return true;
	if (['false', 'no', '0', '否', '停用'].includes(normalized)) return false;
	return null;
}

/**
 * 檢查重複訂閱
 */
export function findDuplicates(
	newSubscriptions: MappedSubscription[],
	existingNames: string[]
): Set<number> {
	const duplicates = new Set<number>();
	const nameSet = new Set(existingNames.map((n) => n.toLowerCase()));
	const newNames = new Set<string>();

	for (const sub of newSubscriptions) {
		const name = sub.data.name.toLowerCase();

		if (nameSet.has(name) || newNames.has(name)) {
			duplicates.add(sub.row);
		}
		newNames.add(name);
	}

	return duplicates;
}
