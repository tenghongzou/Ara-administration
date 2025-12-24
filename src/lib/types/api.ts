// 通用響應型別
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	errors?: ValidationErrors;
}

export interface ValidationErrors {
	[field: string]: string[];
}

// 分頁相關
export interface Pagination {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

export interface PaginatedData<T> {
	data: T[];
	pagination: Pagination;
}

// 排序相關
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
	field: string;
	direction: SortDirection;
}

// 篩選相關
export interface FilterConfig {
	field: string;
	operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';
	value: unknown;
}
