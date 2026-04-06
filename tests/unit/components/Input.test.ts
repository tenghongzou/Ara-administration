import { describe, it } from 'vitest';

// TODO: Implement real component tests with @testing-library/svelte when Svelte 5 support is stable

describe('Input Component', () => {
	it.todo('should have default type as text');
	it.todo('should support all input types (text, email, password, number, tel, url, search)');
	it.todo('should support label prop');
	it.todo('should support error prop');
	it.todo('should support hint prop');
	it.todo('should support disabled prop');
	it.todo('should support required prop');
	it.todo('should support readonly prop');
	it.todo('should support placeholder prop');
	it.todo('should support name prop');
	it.todo('should support id prop');
	it.todo('should support autocomplete prop');
	it.todo('should support custom class');
	it.todo('should support inputClass');

	describe('styling', () => {
		it.todo('should have error styling when error exists');
		it.todo('should have normal styling without error');
	});

	describe('accessibility', () => {
		it.todo('should associate label with input via id');
		it.todo('should have aria-invalid when error exists');
		it.todo('should have aria-describedby for error message');
		it.todo('should show required indicator');
	});

	describe('event handlers', () => {
		it.todo('should support oninput');
		it.todo('should support onchange');
		it.todo('should support onblur');
	});
});
