import { describe, it, expect } from 'vitest';
import {
	autoDetectMapping,
	mapAndValidateData,
	findDuplicates,
	type ParsedRow,
	type FieldMapping,
	type MappedSubscription
} from '$lib/utils/csv-parser';

describe('CSV Parser', () => {
	describe('autoDetectMapping', () => {
		it('should detect English headers', () => {
			const headers = [
				'Name',
				'Category',
				'Cost',
				'Currency',
				'Billing Cycle',
				'Next Billing Date',
				'Status',
				'Description',
				'Website',
				'Email',
				'Payment Method',
				'Auto Renew',
				'Reminder Days'
			];

			const mapping = autoDetectMapping(headers);

			expect(mapping.name).toBe('Name');
			expect(mapping.category).toBe('Category');
			expect(mapping.cost).toBe('Cost');
			expect(mapping.currency).toBe('Currency');
			expect(mapping.billingCycle).toBe('Billing Cycle');
			expect(mapping.nextBillingDate).toBe('Next Billing Date');
			expect(mapping.status).toBe('Status');
			expect(mapping.description).toBe('Description');
			expect(mapping.website).toBe('Website');
			expect(mapping.accountEmail).toBe('Email');
			expect(mapping.paymentMethod).toBe('Payment Method');
			expect(mapping.autoRenew).toBe('Auto Renew');
			expect(mapping.reminderDays).toBe('Reminder Days');
		});

		it('should detect Chinese headers', () => {
			const headers = ['服務名稱', '分類', '費用', '幣別', '週期', '下次扣款日', '狀態', '描述', '網址', '信箱', '付款方式', '自動續約', '提醒天數'];

			const mapping = autoDetectMapping(headers);

			expect(mapping.name).toBe('服務名稱');
			expect(mapping.category).toBe('分類');
			expect(mapping.cost).toBe('費用');
			expect(mapping.currency).toBe('幣別');
			expect(mapping.billingCycle).toBe('週期');
			expect(mapping.nextBillingDate).toBe('下次扣款日');
			expect(mapping.status).toBe('狀態');
			expect(mapping.description).toBe('描述');
			expect(mapping.website).toBe('網址');
			expect(mapping.accountEmail).toBe('信箱');
			expect(mapping.paymentMethod).toBe('付款方式');
			expect(mapping.autoRenew).toBe('自動續約');
			expect(mapping.reminderDays).toBe('提醒天數');
		});

		it('should return null for unmatched headers', () => {
			const headers = ['Column1', 'Column2', 'Column3'];

			const mapping = autoDetectMapping(headers);

			expect(mapping.name).toBeNull();
			expect(mapping.category).toBeNull();
			expect(mapping.cost).toBeNull();
		});

		it('should handle mixed English and Chinese headers', () => {
			const headers = ['Name', '分類', 'Price', '下次扣款日'];

			const mapping = autoDetectMapping(headers);

			expect(mapping.name).toBe('Name');
			expect(mapping.category).toBe('分類');
			expect(mapping.cost).toBe('Price');
			expect(mapping.nextBillingDate).toBe('下次扣款日');
		});

		it('should handle alternative English header names', () => {
			const headers = ['amount', 'desc', 'url'];

			const mapping = autoDetectMapping(headers);

			expect(mapping.cost).toBe('amount');
			expect(mapping.description).toBe('desc');
			expect(mapping.website).toBe('url');
		});

		it('should only assign a field once even if multiple headers match', () => {
			// Both 'price' and 'amount' could match 'cost', but only the first should be assigned
			const headers = ['price', 'amount'];
			const mapping = autoDetectMapping(headers);

			expect(mapping.cost).toBe('price');
		});

		it('should handle empty headers array', () => {
			const mapping = autoDetectMapping([]);

			expect(mapping.name).toBeNull();
			expect(mapping.cost).toBeNull();
		});
	});

	describe('mapAndValidateData', () => {
		const baseMapping: FieldMapping = {
			name: 'Name',
			category: 'Category',
			cost: 'Cost',
			currency: 'Currency',
			billingCycle: 'Cycle',
			nextBillingDate: 'Next Date',
			status: 'Status',
			description: 'Description',
			website: 'Website',
			accountEmail: 'Email',
			paymentMethod: 'Payment',
			autoRenew: 'Auto Renew',
			reminderDays: 'Reminder'
		};

		it('should map valid data correctly', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Netflix',
					Category: 'streaming',
					Cost: '15.99',
					Currency: 'USD',
					Cycle: 'monthly',
					'Next Date': '2024-02-01',
					Status: 'active',
					Description: 'Video streaming',
					Website: 'https://netflix.com',
					Email: 'test@example.com',
					Payment: 'credit_card',
					'Auto Renew': 'yes',
					Reminder: '3'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results).toHaveLength(1);
			expect(results[0].errors).toHaveLength(0);
			expect(results[0].data.name).toBe('Netflix');
			expect(results[0].data.category).toBe('streaming');
			expect(results[0].data.cost).toBe(15.99);
			expect(results[0].data.currency).toBe('USD');
			expect(results[0].data.billingCycle).toBe('monthly');
			expect(results[0].data.nextBillingDate).toBe('2024-02-01');
			expect(results[0].data.paymentMethod).toBe('credit_card');
			expect(results[0].data.autoRenew).toBe(true);
			expect(results[0].data.reminderDays).toBe(3);
			expect(results[0].row).toBe(1);
		});

		it('should report errors for missing required fields', () => {
			const data: ParsedRow[] = [
				{
					Name: '',
					Cost: '',
					'Next Date': ''
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results[0].errors.length).toBeGreaterThanOrEqual(3);
			const errorFields = results[0].errors.map((e) => e.field);
			expect(errorFields).toContain('name');
			expect(errorFields).toContain('cost');
			expect(errorFields).toContain('nextBillingDate');
		});

		it('should report error for invalid cost value', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Cost: 'not-a-number',
					'Next Date': '2024-01-15'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			const costError = results[0].errors.find((e) => e.field === 'cost');
			expect(costError).toBeDefined();
			expect(costError!.message).toContain('數字');
		});

		it('should report error for zero or negative cost', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Cost: '0',
					'Next Date': '2024-01-15'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			const costError = results[0].errors.find((e) => e.field === 'cost');
			expect(costError).toBeDefined();
		});

		it('should report error for invalid date format', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Cost: '10',
					'Next Date': '01/15/2024'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			const dateError = results[0].errors.find((e) => e.field === 'nextBillingDate');
			expect(dateError).toBeDefined();
			expect(dateError!.message).toContain('YYYY-MM-DD');
		});

		it('should handle Chinese category values', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Spotify',
					Category: '音樂',
					Cost: '149',
					'Next Date': '2024-03-01'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results[0].data.category).toBe('music');
		});

		it('should default to "other" for unrecognized categories and add warning', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Category: 'unknown-category',
					Cost: '10',
					'Next Date': '2024-01-15'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results[0].data.category).toBe('other');
			expect(results[0].warnings.length).toBeGreaterThan(0);
		});

		it('should handle Chinese billing cycle values', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Cycle: '年繳',
					Cost: '1000',
					'Next Date': '2024-12-01'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results[0].data.billingCycle).toBe('yearly');
		});

		it('should handle Chinese payment method values', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Cost: '500',
					'Next Date': '2024-06-01',
					Payment: '信用卡'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results[0].data.paymentMethod).toBe('credit_card');
		});

		it('should handle Chinese boolean values for autoRenew', () => {
			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Cost: '10',
					'Next Date': '2024-01-01',
					'Auto Renew': '是'
				}
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results[0].data.autoRenew).toBe(true);
		});

		it('should default currency to TWD when not provided', () => {
			const minimalMapping: FieldMapping = {
				...baseMapping,
				currency: null
			};

			const data: ParsedRow[] = [
				{
					Name: 'Service',
					Cost: '100',
					'Next Date': '2024-01-01'
				}
			];

			const results = mapAndValidateData(data, minimalMapping);

			expect(results[0].data.currency).toBe('TWD');
		});

		it('should process multiple rows independently', () => {
			const data: ParsedRow[] = [
				{ Name: 'Valid', Cost: '10', 'Next Date': '2024-01-01' },
				{ Name: '', Cost: 'bad', 'Next Date': '' },
				{ Name: 'Also Valid', Cost: '20', 'Next Date': '2024-06-15' }
			];

			const results = mapAndValidateData(data, baseMapping);

			expect(results).toHaveLength(3);
			expect(results[0].errors).toHaveLength(0);
			expect(results[1].errors.length).toBeGreaterThan(0);
			expect(results[2].errors).toHaveLength(0);
			expect(results[0].row).toBe(1);
			expect(results[1].row).toBe(2);
			expect(results[2].row).toBe(3);
		});
	});

	describe('findDuplicates', () => {
		it('should find duplicates against existing names', () => {
			const newSubs: MappedSubscription[] = [
				{ data: { name: 'Netflix', cost: 10 }, row: 1, errors: [], warnings: [] },
				{ data: { name: 'Spotify', cost: 15 }, row: 2, errors: [], warnings: [] }
			];

			const existingNames = ['Netflix', 'Hulu'];
			const duplicates = findDuplicates(newSubs, existingNames);

			expect(duplicates.has(1)).toBe(true);
			expect(duplicates.has(2)).toBe(false);
		});

		it('should find duplicates within new subscriptions', () => {
			const newSubs: MappedSubscription[] = [
				{ data: { name: 'Netflix', cost: 10 }, row: 1, errors: [], warnings: [] },
				{ data: { name: 'Spotify', cost: 15 }, row: 2, errors: [], warnings: [] },
				{ data: { name: 'Netflix', cost: 20 }, row: 3, errors: [], warnings: [] }
			];

			const duplicates = findDuplicates(newSubs, []);

			expect(duplicates.has(1)).toBe(false); // First occurrence is not a duplicate
			expect(duplicates.has(3)).toBe(true); // Second occurrence is a duplicate
		});

		it('should be case-insensitive', () => {
			const newSubs: MappedSubscription[] = [
				{ data: { name: 'netflix', cost: 10 }, row: 1, errors: [], warnings: [] }
			];

			const existingNames = ['Netflix'];
			const duplicates = findDuplicates(newSubs, existingNames);

			expect(duplicates.has(1)).toBe(true);
		});

		it('should return empty set when no duplicates', () => {
			const newSubs: MappedSubscription[] = [
				{ data: { name: 'Service A', cost: 10 }, row: 1, errors: [], warnings: [] },
				{ data: { name: 'Service B', cost: 20 }, row: 2, errors: [], warnings: [] }
			];

			const duplicates = findDuplicates(newSubs, ['Service C']);

			expect(duplicates.size).toBe(0);
		});

		it('should handle empty inputs', () => {
			const duplicates = findDuplicates([], []);
			expect(duplicates.size).toBe(0);
		});
	});
});
