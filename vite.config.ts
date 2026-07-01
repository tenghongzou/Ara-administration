import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	server: {
		port: 3000,
		host: true,
		proxy: {
			'/api': {
				// Docker 環境使用 http://php:80，本地開發使用 http://localhost:80
				target: process.env.API_URL || 'http://php:80',
				changeOrigin: true
			},
			// 聊天服務(Rust)：strip /chat 前綴,對齊 prod 的 Caddy handle_path。
			// 同時代理 WebSocket(/chat/ws)。
			'/chat': {
				target: process.env.CHAT_URL || 'http://chat:8082',
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/chat/, '')
			}
		}
	},

	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: false
	},

	optimizeDeps: {
		include: ['clsx', 'tailwind-merge']
	},

	test: {
		include: ['tests/unit/**/*.{test,spec}.ts'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			exclude: ['node_modules/', 'tests/', '.svelte-kit/']
		}
	}
});
