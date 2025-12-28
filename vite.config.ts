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
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	},

	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: true
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
