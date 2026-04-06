import { describe, it } from 'vitest';

// TODO: Implement real component tests with @testing-library/svelte when Svelte 5 support is stable

describe('Button Component', () => {
	it.todo('should have default variant as primary');
	it.todo('should have all variant options (primary, secondary, outline, ghost, danger, link)');
	it.todo('should have all size options (sm, md, lg, icon)');
	it.todo('should have default size as md');
	it.todo('should have default type as button');
	it.todo('should support type submit and reset');
	it.todo('should support disabled state');
	it.todo('should support loading state');
	it.todo('should be disabled when loading');
	it.todo('should support href for link button');
	it.todo('should support aria-label');
	it.todo('should support custom class');

	describe('variant styles', () => {
		it.todo('primary should have bg-primary color');
		it.todo('danger should have bg-red color');
		it.todo('outline should have border');
		it.todo('ghost should be transparent');
	});

	describe('size styles', () => {
		it.todo('sm should have h-8');
		it.todo('md should have h-10');
		it.todo('lg should have h-12');
		it.todo('icon should be square');
	});
});
