/**
 * Export data to CSV file and trigger download
 */
export function exportToCSV<T extends Record<string, unknown>>(
	data: T[],
	filename: string,
	columns: { key: keyof T; label: string }[]
): void {
	if (data.length === 0) return;

	// Create header row
	const headers = columns.map((col) => escapeCSV(col.label)).join(',');

	// Create data rows
	const rows = data.map((item) =>
		columns
			.map((col) => {
				const value = item[col.key];
				if (value === null || value === undefined) return '';
				if (typeof value === 'object') return escapeCSV(JSON.stringify(value));
				return escapeCSV(String(value));
			})
			.join(',')
	);

	// Combine headers and rows
	const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n'); // BOM for Excel UTF-8

	// Create blob and download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to JSON file and trigger download
 */
export function exportToJSON<T>(data: T[], filename: string): void {
	const jsonContent = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
	downloadBlob(blob, `${filename}.json`);
}

/**
 * Escape special characters for CSV
 */
function escapeCSV(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

/**
 * Trigger download of a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Format timestamp for export filename
 */
export function getExportFilename(prefix: string): string {
	const now = new Date();
	const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
	const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
	return `${prefix}_${dateStr}_${timeStr}`;
}
