import { describe, it } from 'vitest';

// TODO: Implement real component tests with @testing-library/svelte when Svelte 5 support is stable

describe('Modal Component', () => {
	it.todo('should have default size as md');
	it.todo('should support all size options (sm, md, lg, xl, full)');
	it.todo('should be closable by default');
	it.todo('should support title prop');
	it.todo('should support open state');
	it.todo('should support custom class');

	describe('sizes', () => {
		it.todo('sm should have max-w-sm');
		it.todo('md should have max-w-md');
		it.todo('lg should have max-w-lg');
		it.todo('xl should have max-w-xl');
		it.todo('full should have max-w-4xl');
	});

	describe('accessibility', () => {
		it.todo('should have role dialog');
		it.todo('should have aria-modal true');
		it.todo('should have aria-labelledby when title provided');
	});

	describe('close behavior', () => {
		it.todo('should close on ESC key when closable');
		it.todo('should not close on ESC when not closable');
		it.todo('should show close button when closable');
		it.todo('should not show close button when not closable');
		it.todo('should close on backdrop click');
	});

	describe('snippets', () => {
		it.todo('should support children snippet');
		it.todo('should support header snippet');
		it.todo('should support footer snippet');
	});

	describe('callbacks', () => {
		it.todo('should support onClose callback');
	});
});
