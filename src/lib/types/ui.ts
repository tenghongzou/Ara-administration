// UI 相關型別
export type Theme = 'light' | 'dark' | 'system';

export type Size = 'sm' | 'md' | 'lg';

export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface MenuItem {
	label: string;
	href: string;
	icon?: string;
	badge?: string | number;
	children?: MenuItem[];
}

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export interface TableColumn<T> {
	key: keyof T | string;
	header: string;
	sortable?: boolean;
	width?: string;
	align?: 'left' | 'center' | 'right';
}
