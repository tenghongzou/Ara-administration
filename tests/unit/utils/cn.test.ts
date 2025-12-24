import { describe, it, expect } from 'vitest';
import { cn } from '$lib/utils';

describe('cn utility', () => {
	it('should merge class names', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('should handle conditional classes', () => {
		const isActive = true;
		const isDisabled = false;

		expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
	});

	it('should handle undefined and null values', () => {
		expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
	});

	it('should handle empty strings', () => {
		expect(cn('foo', '', 'bar')).toBe('foo bar');
	});

	it('should resolve Tailwind conflicts - padding', () => {
		expect(cn('p-2', 'p-4')).toBe('p-4');
	});

	it('should resolve Tailwind conflicts - colors', () => {
		expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
	});

	it('should resolve Tailwind conflicts - background', () => {
		expect(cn('bg-white', 'bg-gray-100')).toBe('bg-gray-100');
	});

	it('should handle array of classes', () => {
		expect(cn(['foo', 'bar'])).toBe('foo bar');
	});

	it('should handle object notation', () => {
		expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
	});

	it('should handle mixed inputs', () => {
		expect(cn('base', ['array-class'], { 'object-class': true })).toBe(
			'base array-class object-class'
		);
	});

	it('should handle complex Tailwind merging', () => {
		expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
	});

	it('should preserve non-conflicting classes', () => {
		expect(cn('rounded-lg shadow-md', 'hover:shadow-lg')).toBe('rounded-lg shadow-md hover:shadow-lg');
	});
});
