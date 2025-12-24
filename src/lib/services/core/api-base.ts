/**
 * API 基礎工具模組
 * 提供所有 API 共用的工具函數
 */

/** 模擬 API 延遲 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 分頁回應介面 */
export interface PaginationInfo {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

/** 建立分頁回應 */
export function createPaginatedResponse<T>(
	data: T[],
	filtered: T[],
	page: number,
	pageSize: number
): { data: T[]; pagination: PaginationInfo } {
	const total = filtered.length;
	const start = (page - 1) * pageSize;
	const paginatedData = filtered.slice(start, start + pageSize);

	return {
		data: paginatedData,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.ceil(total / pageSize)
		}
	};
}

/** 通用排序函數 */
export function sortByField<T>(
	data: T[],
	sortBy: string | undefined,
	sortDirection: 'asc' | 'desc' = 'asc'
): T[] {
	if (!sortBy) return data;

	return [...data].sort((a, b) => {
		const aVal = a[sortBy as keyof T];
		const bVal = b[sortBy as keyof T];
		if (aVal === undefined || bVal === undefined) return 0;
		const comparison = String(aVal).localeCompare(String(bVal));
		return sortDirection === 'asc' ? comparison : -comparison;
	});
}

/** 通用搜尋過濾 */
export function filterBySearch<T>(
	data: T[],
	search: string | undefined,
	fields: (keyof T)[]
): T[] {
	if (!search) return data;

	const searchLower = search.toLowerCase();
	return data.filter((item) =>
		fields.some((field) => {
			const value = item[field];
			return typeof value === 'string' && value.toLowerCase().includes(searchLower);
		})
	);
}
