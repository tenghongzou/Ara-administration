import * as XLSX from 'xlsx';
import type { ParsedRow, ParseResult } from './csv-parser';

/**
 * 解析 Excel 檔案 (.xlsx, .xls)
 */
export async function parseExcel(file: File): Promise<ParseResult> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const data = e.target?.result;
				const workbook = XLSX.read(data, { type: 'binary' });

				// 讀取第一個工作表
				const firstSheetName = workbook.SheetNames[0];
				if (!firstSheetName) {
					reject(new Error('Excel 檔案中沒有工作表'));
					return;
				}

				const worksheet = workbook.Sheets[firstSheetName];

				// 轉換為 JSON，保留表頭
				const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, {
					header: 1,
					defval: ''
				}) as string[][];

				if (jsonData.length === 0) {
					resolve({ data: [], headers: [], errors: [] });
					return;
				}

				// 第一列為表頭
				const headers = jsonData[0].map((h) => String(h).trim());
				const rows = jsonData.slice(1);

				// 轉換為物件格式
				const parsedData: ParsedRow[] = rows
					.filter((row) => row.some((cell) => cell !== '')) // 過濾空行
					.map((row) => {
						const obj: ParsedRow = {};
						headers.forEach((header, index) => {
							obj[header] = String(row[index] ?? '').trim();
						});
						return obj;
					});

				resolve({
					data: parsedData,
					headers,
					errors: []
				});
			} catch (error) {
				reject(new Error(`Excel 解析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
			}
		};

		reader.onerror = () => {
			reject(new Error('讀取檔案失敗'));
		};

		reader.readAsBinaryString(file);
	});
}

/**
 * 判斷檔案類型
 */
export function getFileType(file: File): 'csv' | 'excel' | 'unknown' {
	const extension = file.name.split('.').pop()?.toLowerCase();
	const mimeType = file.type;

	if (extension === 'csv' || mimeType === 'text/csv') {
		return 'csv';
	}

	if (
		['xlsx', 'xls'].includes(extension || '') ||
		mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
		mimeType === 'application/vnd.ms-excel'
	) {
		return 'excel';
	}

	return 'unknown';
}

/**
 * 匯出資料為 Excel
 */
export function exportToExcel(data: Record<string, unknown>[], filename: string = 'export.xlsx') {
	const worksheet = XLSX.utils.json_to_sheet(data);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
	XLSX.writeFile(workbook, filename);
}
