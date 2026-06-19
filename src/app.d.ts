/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
	readonly VITE_API_HOST: string;
	readonly VITE_API_VERSION: string;
	readonly VITE_WS_URL: string;
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_VERSION: string;
	readonly VITE_APP_ENV: string;
	readonly VITE_DEBUG: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare global {
	namespace App {
		interface Error {}
		interface Locals {}
		interface PageData {}
		interface PageState {}
		interface Platform {}
	}
}

export {};
