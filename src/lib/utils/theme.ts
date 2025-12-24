export type Theme = 'light' | 'dark' | 'system';

/**
 * 套用主題到 document
 */
export function applyTheme(theme: Theme) {
	const root = document.documentElement;
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

	if (isDark) {
		root.classList.add('dark');
		root.style.colorScheme = 'dark';
	} else {
		root.classList.remove('dark');
		root.style.colorScheme = 'light';
	}
}

/**
 * 初始化主題並監聽系統主題變更
 */
export function initTheme(theme: Theme) {
	if (typeof window === 'undefined') return;

	applyTheme(theme);

	// 監聽系統主題變更（僅在 system 模式時有效）
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		// 重新讀取當前設定的主題
		const storedTheme = localStorage.getItem('theme') as Theme | null;
		if (storedTheme === 'system' || !storedTheme) {
			applyTheme('system');
		}
	});
}

/**
 * 取得當前實際顯示的主題（light 或 dark）
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
	if (theme === 'system') {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return 'light';
	}
	return theme;
}
