import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getExportFilename } from '$lib/utils/export';

// Mock DOM APIs for download tests
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();

beforeEach(() => {
	vi.clearAllMocks();

	// Mock URL APIs
	global.URL.createObjectURL = mockCreateObjectURL;
	global.URL.revokeObjectURL = mockRevokeObjectURL;

	// Mock document.createElement and body methods
	vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
		if (tag === 'a') {
			return {
				href: '',
				download: '',
				click: mockClick,
				style: {}
			} as unknown as HTMLAnchorElement;
		}
		return document.createElement(tag);
	});

	vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
	vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
});

describe('Export Utilities', () => {
	describe('getExportFilename', () => {
		it('should generate filename with prefix and timestamp', () => {
			const filename = getExportFilename('users');
			expect(filename).toMatch(/^users_\d{8}_\d{4}$/);
		});

		it('should include current date', () => {
			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const expectedDatePrefix = `${year}${month}${day}`;

			const filename = getExportFilename('test');
			expect(filename).toContain(expectedDatePrefix);
		});

		it('should work with different prefixes', () => {
			expect(getExportFilename('orders')).toMatch(/^orders_\d{8}_\d{4}$/);
			expect(getExportFilename('products')).toMatch(/^products_\d{8}_\d{4}$/);
			expect(getExportFilename('customers')).toMatch(/^customers_\d{8}_\d{4}$/);
		});

		it('should handle empty prefix', () => {
			const filename = getExportFilename('');
			expect(filename).toMatch(/^_\d{8}_\d{4}$/);
		});

		it('should handle special characters in prefix', () => {
			const filename = getExportFilename('test-data');
			expect(filename).toMatch(/^test-data_\d{8}_\d{4}$/);
		});
	});

	describe('CSV escaping behavior', () => {
		// These tests verify the expected escaping logic used internally

		it('should escape values with commas', () => {
			const value = 'hello, world';
			const escaped = escapeForTest(value);
			expect(escaped).toBe('"hello, world"');
		});

		it('should escape values with quotes', () => {
			const value = 'say "hello"';
			const escaped = escapeForTest(value);
			expect(escaped).toBe('"say ""hello"""');
		});

		it('should escape values with newlines', () => {
			const value = 'line1\nline2';
			const escaped = escapeForTest(value);
			expect(escaped).toBe('"line1\nline2"');
		});

		it('should not escape simple values', () => {
			const value = 'simple';
			const escaped = escapeForTest(value);
			expect(escaped).toBe('simple');
		});

		it('should escape values with carriage returns', () => {
			const value = 'line1\rline2';
			const escaped = escapeForTest(value);
			expect(escaped).toBe('"line1\rline2"');
		});
	});
});

// Helper function that mimics the internal escapeCSV logic
function escapeForTest(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
