import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface UIState {
	sidebarOpen: boolean;
	isMobile: boolean;
	theme: 'light' | 'dark' | 'system';
	locale: string;
}

const MOBILE_BREAKPOINT = 1024; // lg breakpoint

function getInitialState(): UIState {
	const isMobile = browser ? window.innerWidth < MOBILE_BREAKPOINT : false;
	const savedTheme = browser ? (localStorage.getItem('theme') as UIState['theme']) : null;
	return {
		sidebarOpen: !isMobile, // Default closed on mobile
		isMobile,
		theme: savedTheme || 'system',
		locale: 'zh-TW'
	};
}

function createUIStore() {
	const { subscribe, update, set } = writable<UIState>(getInitialState());

	// Handle window resize
	if (browser) {
		window.addEventListener('resize', () => {
			const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
			update((state) => {
				// Auto-close sidebar when switching to mobile
				if (isMobile && !state.isMobile) {
					return { ...state, isMobile, sidebarOpen: false };
				}
				// Auto-open sidebar when switching to desktop
				if (!isMobile && state.isMobile) {
					return { ...state, isMobile, sidebarOpen: true };
				}
				return { ...state, isMobile };
			});
		});
	}

	return {
		subscribe,
		toggleSidebar: () => {
			update((state) => ({ ...state, sidebarOpen: !state.sidebarOpen }));
		},
		openSidebar: () => {
			update((state) => ({ ...state, sidebarOpen: true }));
		},
		closeSidebar: () => {
			update((state) => ({ ...state, sidebarOpen: false }));
		},
		setTheme: (theme: UIState['theme']) => {
			if (browser) {
				localStorage.setItem('theme', theme);
			}
			update((state) => ({ ...state, theme }));
		},
		setLocale: (locale: string) => {
			update((state) => ({ ...state, locale }));
		}
	};
}

export const ui = createUIStore();
