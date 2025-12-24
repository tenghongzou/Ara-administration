import type { Snippet } from 'svelte';

export interface DataGridColumn<T> {
	key: keyof T | string;
	header: string;
	width?: string;
	minWidth?: string;
	maxWidth?: string;
	align?: 'left' | 'center' | 'right';
	sortable?: boolean;
	resizable?: boolean;
	frozen?: boolean;
	render?: Snippet<[T, number]>;
	headerRender?: Snippet;
}
