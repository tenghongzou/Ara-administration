# Deployment Guide

This document covers environment requirements, build process, Docker deployment, CI/CD setup, and monitoring for Ara Administration.

---

## Table of Contents

1. [Environment Requirements](#environment-requirements)
2. [Project Initialization](#project-initialization)
3. [Project Configuration](#project-configuration)
4. [Development Environment](#development-environment)
5. [Build Process](#build-process)
6. [Deployment Platforms](#deployment-platforms)
7. [CI/CD Setup](#cicd-setup)
8. [Environment Variables](#environment-variables)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & Logging](#monitoring--logging)
11. [Troubleshooting](#troubleshooting)

---

## Environment Requirements

### Required Software

| Software | Minimum Version | Recommended Version |
|----------|-----------------|---------------------|
| Node.js | 18.x | 20.x LTS |
| pnpm | 8.x | 9.x |
| Git | 2.30+ | Latest |

### Optional Tools

| Tool | Purpose |
|------|---------|
| Docker | Containerized deployment |
| VS Code | Recommended editor |

### VS Code Extensions

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

## Project Initialization

### Create New Project

```bash
# Using SvelteKit official template
pnpm create svelte@latest .

# Select the following options:
# - Skeleton project
# - TypeScript
# - ESLint
# - Prettier
# - Playwright (for E2E testing)
# - Vitest (for unit testing)
```

### Install Core Dependencies

```bash
# Install base dependencies
pnpm install

# Install Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p

# Install utility libraries
pnpm add clsx tailwind-merge
pnpm add zod
pnpm add dayjs

# Install development tools
pnpm add -D @types/node
pnpm add -D @sveltejs/adapter-static
```

### Create Project Structure

```bash
# Create directory structure
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

## Project Configuration

### SvelteKit Configuration

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

### Vite Configuration

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

### TypeScript Configuration

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
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
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

### Tailwind CSS Configuration

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
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
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

### Global Styles

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
    @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
    @apply dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100;
  }

  .card {
    @apply bg-white rounded-lg border border-gray-200;
    @apply dark:bg-gray-900 dark:border-gray-700;
  }
}
```

---

## Development Environment

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

### Development Server

```bash
# Start development server
pnpm dev

# Start with external access
pnpm dev:host

# Default address
# http://localhost:3000
```

### Hot Module Replacement (HMR)

Vite enables HMR by default, automatically updating the browser when files are modified.

---

## Build Process

### Production Build

```bash
# Run build
pnpm build

# Build output location
# ./build/

# Preview build result
pnpm preview
```

### Build Checklist

```bash
# 1. Type check
pnpm check

# 2. Lint check
pnpm lint

# 3. Format check
pnpm format:check

# 4. Unit tests
pnpm test:unit

# 5. Build
pnpm build
```

### Build Output Analysis

```bash
# Install analysis tool
pnpm add -D rollup-plugin-visualizer

# Add to vite.config.ts
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

## Deployment Platforms

### Vercel Deployment

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
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Netlify Deployment

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

### Cloudflare Pages Deployment

```bash
# Build settings
# Build command: pnpm build
# Build output directory: build
# Node.js version: 20
```

### GitHub Pages Deployment

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

### Nginx Self-Hosted

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

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/admin.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Root directory
    root /var/www/admin/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Static asset caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# Production image
FROM nginx:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build output
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf (for Docker)
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

## CI/CD Setup

### GitHub Actions - Full Pipeline

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

      - name: Deploy to production
        run: echo "Deploy to production server"
```

---

## Environment Variables

### Environment Variable Files

```bash
# .env.example - Example file (commit to version control)
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Admin Dashboard
VITE_APP_VERSION=1.0.0

# .env.development - Development (do not commit)
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DEBUG=true

# .env.production - Production (do not commit)
VITE_API_BASE_URL=https://api.example.com
VITE_DEBUG=false
```

### Environment Variable Access

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

### Type Definitions

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

## Performance Optimization

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false, // Disable in production
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('svelte')) return 'svelte';
            if (id.includes('chart.js')) return 'charts';
            return 'vendor';
          }
        }
      }
    }
  }
});
```

### Resource Optimization

```html
<!-- src/app.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Preconnect to important resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://api.example.com" />

    <!-- DNS prefetch -->
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### Image Optimization

```svelte
<!-- Using enhanced:img -->
<enhanced:img
  src="./hero.png"
  alt="Hero image"
  sizes="(max-width: 768px) 100vw, 50vw"
/>

<!-- Lazy loading -->
<img src={imageUrl} alt="Description" loading="lazy" />
```

---

## Monitoring & Logging

### Error Tracking

```typescript
// src/lib/utils/error-tracking.ts
interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

export function captureError(error: Error, context?: ErrorContext): void {
  // Development: log to console
  if (import.meta.env.DEV) {
    console.error('Error captured:', error, context);
    return;
  }

  // Production: send to error tracking service
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

// Global error handling
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

### Performance Monitoring

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

## Troubleshooting

### Common Issues

#### 1. Build Failure: TypeScript Errors

```bash
# Solution
pnpm check  # Check specific errors
pnpm exec svelte-kit sync  # Sync types
```

#### 2. Hot Reload Not Working

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    watch: {
      usePolling: true  // May be needed for Windows/WSL
    }
  }
});
```

#### 3. Route 404 Errors (SPA Deployment)

Ensure server is configured with fallback to `index.html`.

#### 4. API CORS Issues

```typescript
// vite.config.ts - Development proxy
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

#### 5. Environment Variables Not Working

- Ensure variable names start with `VITE_`
- Restart development server
- Check `.env` file is in correct location

### Debugging Tips

```typescript
// Conditional debugging
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// Performance timing
console.time('operation');
// ... operation
console.timeEnd('operation');

// Network request tracing
// Use browser DevTools Network panel
```

### Health Check Endpoint

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

## Pre-Launch Checklist

- [ ] All TypeScript errors fixed
- [ ] ESLint check passed
- [ ] Unit tests passed
- [ ] E2E tests passed
- [ ] Build successful
- [ ] Environment variables configured
- [ ] SSL certificate configured
- [ ] Error tracking set up
- [ ] Performance monitoring set up
- [ ] Backup strategy confirmed

---

## Related Documentation

- [Architecture](./01-architecture.md)
- [Development Guide](./02-development-guide.md)
- [API Integration](./03-api-integration.md)
- [Component Design](./04-component-design.md)

## External Links

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte 5 Documentation](https://svelte.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Netlify Deployment Docs](https://docs.netlify.com/)

