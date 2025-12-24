# 後台管理系統 - 部署與建置指南

> 版本：1.0.0
> 最後更新：2024年12月

---

## 目錄

1. [環境需求](#環境需求)
2. [專案初始化](#專案初始化)
3. [專案配置](#專案配置)
4. [開發環境](#開發環境)
5. [建置流程](#建置流程)
6. [部署平台](#部署平台)
7. [CI/CD 設置](#cicd-設置)
8. [環境變數管理](#環境變數管理)
9. [效能優化](#效能優化)
10. [監控與日誌](#監控與日誌)
11. [故障排除](#故障排除)

---

## 環境需求

### 必要軟體

| 軟體 | 最低版本 | 建議版本 |
|------|---------|---------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| Git | 2.30+ | 最新版 |

### 可選工具

| 工具 | 用途 |
|------|------|
| Docker | 容器化部署 |
| VS Code | 推薦的編輯器 |

### VS Code 擴充套件

```json
// .vscode/extensions.json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## 專案初始化

### 建立新專案

```bash
# 使用 SvelteKit 官方模板
pnpm create svelte@latest .

# 選擇以下選項：
# - Skeleton project
# - TypeScript
# - ESLint
# - Prettier
# - Playwright (for E2E testing)
# - Vitest (for unit testing)
```

### 安裝核心依賴

```bash
# 安裝基礎依賴
pnpm install

# 安裝 Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p

# 安裝工具庫
pnpm add clsx tailwind-merge
pnpm add zod
pnpm add dayjs

# 安裝開發工具
pnpm add -D @types/node
pnpm add -D @sveltejs/adapter-static
```

### 專案結構建立

```bash
# 建立目錄結構
mkdir -p src/lib/components/ui
mkdir -p src/lib/components/layout
mkdir -p src/lib/components/forms
mkdir -p src/lib/components/data-display
mkdir -p src/lib/stores
mkdir -p src/lib/services
mkdir -p src/lib/utils
mkdir -p src/lib/types
mkdir -p src/lib/constants
mkdir -p src/routes/\(auth\)
mkdir -p src/routes/\(app\)
mkdir -p tests/unit
mkdir -p tests/e2e
```

---

## 專案配置

### SvelteKit 配置

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA fallback
      precompress: true,
      strict: true
    }),

    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $services: 'src/lib/services',
      $utils: 'src/lib/utils',
      $types: 'src/lib/types'
    },

    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn'
    }
  }
};

export default config;
```

### Vite 配置

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte'],
          utils: ['clsx', 'tailwind-merge', 'zod', 'dayjs']
        }
      }
    }
  },

  optimizeDeps: {
    include: ['clsx', 'tailwind-merge']
  }
});
```

### TypeScript 配置

```json
// tsconfig.json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "$lib/*": ["src/lib/*"],
      "$components/*": ["src/lib/components/*"],
      "$stores/*": ["src/lib/stores/*"],
      "$services/*": ["src/lib/services/*"],
      "$utils/*": ["src/lib/utils/*"],
      "$types/*": ["src/lib/types/*"]
    }
  }
}
```

### Tailwind CSS 配置

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    }
  },
  plugins: []
};
```

### PostCSS 配置

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

### 全域樣式

```css
/* src/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-surface: #ffffff;
    --color-surface-secondary: #f9fafb;
    --color-border: #e5e7eb;
  }

  :root.dark {
    --color-surface: #111827;
    --color-surface-secondary: #1f2937;
    --color-border: #374151;
  }

  html {
    @apply antialiased;
  }

  body {
    @apply bg-gray-50 text-gray-900;
    @apply dark:bg-gray-950 dark:text-gray-100;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center;
    @apply px-4 py-2 text-sm font-medium;
    @apply rounded-md transition-colors;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  .input {
    @apply w-full px-3 py-2;
    @apply border border-gray-300 rounded-md;
    @apply text-sm placeholder-gray-400;
    @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
    @apply dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100;
  }

  .card {
    @apply bg-white rounded-lg border border-gray-200;
    @apply dark:bg-gray-900 dark:border-gray-700;
  }
}
```

---

## 開發環境

### Scripts

```json
// package.json
{
  "name": "administration",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "dev:host": "vite dev --host",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint . --ext .js,.ts,.svelte",
    "lint:fix": "eslint . --ext .js,.ts,.svelte --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "prepare": "svelte-kit sync"
  }
}
```

### 開發伺服器

```bash
# 啟動開發伺服器
pnpm dev

# 啟動並開放外部訪問
pnpm dev:host

# 預設位址
# http://localhost:3000
```

### 熱模組替換 (HMR)

Vite 預設啟用 HMR，修改檔案時會自動更新瀏覽器，無需手動重新整理。

---

## 建置流程

### 生產建置

```bash
# 執行建置
pnpm build

# 建置產出位置
# ./build/

# 預覽建置結果
pnpm preview
```

### 建置檢查清單

```bash
# 1. 型別檢查
pnpm check

# 2. Lint 檢查
pnpm lint

# 3. 格式檢查
pnpm format:check

# 4. 單元測試
pnpm test:unit

# 5. 建置
pnpm build
```

### 建置輸出分析

```bash
# 安裝分析工具
pnpm add -D rollup-plugin-visualizer

# 在 vite.config.ts 中加入
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    sveltekit(),
    visualizer({
      filename: 'stats.html',
      open: true
    })
  ]
});
```

---

## 部署平台

### Vercel 部署

```json
// vercel.json
{
  "framework": "sveltekit",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

```bash
# 安裝 Vercel CLI
pnpm add -g vercel

# 部署
vercel

# 部署到生產環境
vercel --prod
```

### Netlify 部署

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### Cloudflare Pages 部署

```bash
# 建置設定
# 建置命令: pnpm build
# 建置輸出目錄: build
# Node.js 版本: 20
```

### GitHub Pages 部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          BASE_PATH: '/${{ github.event.repository.name }}'

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './build'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Nginx 自建伺服器

```nginx
# /etc/nginx/sites-available/admin
server {
    listen 80;
    server_name admin.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.example.com;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/admin.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # 根目錄
    root /var/www/admin/build;
    index index.html;

    # Gzip 壓縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # 靜態資源快取
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由處理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 安全標頭
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm

# 安裝依賴
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 複製原始碼並建置
COPY . .
RUN pnpm build

# 生產環境映像
FROM nginx:alpine

# 複製 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 複製建置產出
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf (Docker 用)
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  admin:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## CI/CD 設置

### GitHub Actions - 完整流程

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint

      - name: Check formatting
        run: pnpm format:check

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run type check
        run: pnpm check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: build/
          retention-days: 7

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build
          path: build/

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: [build, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: build
          path: build/

      # 依據部署平台選擇適當的步驟
      - name: Deploy to production
        run: echo "Deploy to production server"
```

---

## 環境變數管理

### 環境變數檔案

```bash
# .env.example - 範例檔案（提交至版本控制）
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Admin Dashboard
VITE_APP_VERSION=1.0.0

# .env.development - 開發環境（不提交）
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DEBUG=true

# .env.production - 生產環境（不提交）
VITE_API_BASE_URL=https://api.example.com
VITE_DEBUG=false
```

### 環境變數存取

```typescript
// src/lib/constants/config.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  appName: import.meta.env.VITE_APP_NAME || 'Admin',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isDebug: import.meta.env.VITE_DEBUG === 'true'
} as const;
```

### 型別定義

```typescript
// src/app.d.ts
/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace App {
    interface Locals {}
    interface PageData {}
    interface Error {}
    interface Platform {}
  }
}

export {};
```

---

## 效能優化

### 建置優化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false, // 生產環境關閉
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('svelte')) {
              return 'svelte';
            }
            if (id.includes('chart.js')) {
              return 'charts';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
```

### 資源優化

```html
<!-- src/app.html -->
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- 預連接重要資源 -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://api.example.com" />

    <!-- DNS 預解析 -->
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### 圖片優化

```svelte
<!-- 使用 enhanced:img -->
<enhanced:img
  src="./hero.png"
  alt="Hero image"
  sizes="(max-width: 768px) 100vw, 50vw"
/>

<!-- 懶載入 -->
<img src={imageUrl} alt="Description" loading="lazy" />
```

---

## 監控與日誌

### 錯誤追蹤

```typescript
// src/lib/utils/error-tracking.ts
interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

export function captureError(error: Error, context?: ErrorContext): void {
  // 開發環境輸出到控制台
  if (import.meta.env.DEV) {
    console.error('Error captured:', error, context);
    return;
  }

  // 生產環境發送到錯誤追蹤服務
  // 例如: Sentry, LogRocket, etc.
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }).catch(console.error);
}

// 全域錯誤處理
export function setupErrorHandling(): void {
  window.addEventListener('error', (event) => {
    captureError(event.error, { route: window.location.pathname });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    captureError(error, { route: window.location.pathname });
  });
}
```

### 效能監控

```typescript
// src/lib/utils/performance.ts
export function reportWebVitals(): void {
  if (typeof window === 'undefined') return;

  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(console.log);
    onFID(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  });
}

export function measurePageLoad(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    console.log('Page Load Metrics:', {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
      firstByte: navigation.responseStart - navigation.requestStart
    });
  });
}
```

---

## 故障排除

### 常見問題

#### 1. 建置失敗：TypeScript 錯誤

```bash
# 解決方案
pnpm check  # 檢查具體錯誤
pnpm exec svelte-kit sync  # 同步型別
```

#### 2. 熱更新不工作

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    watch: {
      usePolling: true  // Windows/WSL 可能需要
    }
  }
});
```

#### 3. 路由 404 錯誤（SPA 部署）

確保伺服器配置了 fallback 到 `index.html`。

#### 4. API 跨域問題

```typescript
// vite.config.ts - 開發環境代理
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
```

#### 5. 環境變數未生效

- 確認變數名稱以 `VITE_` 開頭
- 重啟開發伺服器
- 檢查 `.env` 檔案是否在正確位置

### 除錯技巧

```typescript
// 條件式除錯
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// 效能標記
console.time('operation');
// ... 操作
console.timeEnd('operation');

// 網路請求追蹤
// 使用瀏覽器 DevTools Network 面板
```

### 健康檢查端點

```typescript
// src/routes/health/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0'
  });
};
```

---

## 附錄

### 相關文檔

- [01-專案架構文檔](./01-專案架構文檔.md)
- [02-開發規範指南](./02-開發規範指南.md)
- [03-API整合規範](./03-API整合規範.md)
- [04-元件設計文檔](./04-元件設計文檔.md)

### 重要連結

- [SvelteKit 官方文檔](https://kit.svelte.dev/)
- [Svelte 5 文檔](https://svelte.dev/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
- [Vite 文檔](https://vitejs.dev/)
- [Vercel 部署文檔](https://vercel.com/docs)
- [Netlify 部署文檔](https://docs.netlify.com/)

### 檢查清單

#### 上線前檢查

- [ ] 所有 TypeScript 錯誤已修正
- [ ] ESLint 檢查通過
- [ ] 單元測試通過
- [ ] E2E 測試通過
- [ ] 建置成功
- [ ] 環境變數已設定
- [ ] SSL 憑證已配置
- [ ] 錯誤追蹤已設定
- [ ] 效能監控已設定
- [ ] 備份策略已確認
