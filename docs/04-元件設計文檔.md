# 後台管理系統 - 元件設計文檔

> 版本：2.1.0
> 最後更新：2024年12月

---

## 目錄

1. [設計系統概述](#設計系統概述)
2. [元件組織架構](#元件組織架構)
3. [設計 Token](#設計-token)
4. [基礎元件](#基礎元件)
5. [表單元件](#表單元件)
6. [資料展示元件](#資料展示元件)
7. [佈局元件](#佈局元件)
8. [回饋元件](#回饋元件)
9. [響應式設計](#響應式設計)
10. [動畫規範](#動畫規範)
11. [元件測試](#元件測試)

---

## 設計系統概述

### 設計原則

| 原則 | 說明 |
|------|------|
| **一致性** | 所有元件遵循統一的視覺語言和互動模式 |
| **可存取性** | 符合 WCAG 2.1 AA 標準，支援鍵盤導覽和螢幕閱讀器 |
| **可組合性** | 元件可自由組合，支援多種使用情境 |
| **可擴展性** | 透過 props 和 slots 提供靈活的客製化能力 |
| **效能優先** | 最小化 bundle 大小，優化渲染效能 |

### 參考設計系統

- Google Material Design 3
- Microsoft Fluent Design
- Stripe Dashboard
- Linear App

---

## 元件組織架構

元件依據用途分為兩大類別：**通用 UI 元件**和**功能模組元件**。

### 通用 UI 元件

位於 `src/lib/components/ui/`，提供可跨模組重用的基礎元件。

```
src/lib/components/ui/
├── Button.svelte
├── Input.svelte
├── Modal.svelte
├── DataTable.svelte
├── Badge.svelte
├── Spinner.svelte
└── index.ts
```

**使用方式：**
```typescript
import { Button, Modal, DataTable } from '$lib/components/ui';
```

**設計準則：**
- 無業務邏輯，純 UI 展示
- 高度可配置 (通過 props)
- 支援 Snippets 插槽擴展
- 符合無障礙標準

### 功能模組元件

位於 `src/lib/modules/{module}/components/`，包含特定業務邏輯的元件。

**模組元件結構：**
```
src/lib/modules/{module}/components/
├── {Module}Content.svelte      # 頁面內容 (Content Wrapper)
├── {Module}DetailContent.svelte # 詳情頁面內容
├── {Module}DataGrid.svelte     # 資料表格
├── {Module}Form.svelte         # 表單元件
├── {Module}Filters.svelte      # 篩選面板
└── {Module}Modal.svelte        # 對話框
```

**完整模組元件清單：**
```
src/lib/modules/
├── dashboard/components/
│   ├── DashboardContent.svelte     # 儀表板頁面內容
│   ├── StatsGrid.svelte
│   ├── ActivityFeed.svelte
│   └── QuickActions.svelte
│
├── subscriptions/components/
│   ├── SubscriptionsContent.svelte   # 訂閱列表頁面
│   ├── SubscriptionDetailContent.svelte
│   ├── ImportContent.svelte          # 匯入流程
│   ├── AnalyticsContent.svelte       # 分析圖表
│   ├── CalendarContent.svelte        # 日曆視圖
│   ├── SubscriptionForm.svelte
│   └── SubscriptionFiltersPanel.svelte
│
├── notifications/components/
│   ├── NotificationsContent.svelte   # 通知列表頁面
│   ├── NotificationDetailContent.svelte
│   ├── NotificationList.svelte
│   └── NotificationFilters.svelte
│
├── logs/components/
│   ├── LogsContent.svelte            # 日誌列表頁面
│   ├── LogDetailModal.svelte
│   └── LogExportDialog.svelte
│
├── account/components/
│   ├── ProfileContent.svelte         # 個人資料頁面
│   ├── SecurityContent.svelte        # 安全設定頁面
│   ├── SecurityModals.svelte
│   └── AvatarUpload.svelte
│
├── users/components/
│   ├── UsersContent.svelte           # 使用者列表頁面
│   ├── UserDetailContent.svelte
│   ├── UsersDataGrid.svelte
│   ├── UsersDeleteModals.svelte
│   └── UserForm.svelte
│
├── roles/components/
│   ├── RolesContent.svelte           # 角色列表頁面
│   ├── RoleDetailContent.svelte
│   ├── RolesDataGrid.svelte
│   ├── PermissionSelector.svelte
│   └── RoleForm.svelte
│
└── settings/components/
    ├── GeneralSettingsContent.svelte  # 一般設定頁面
    ├── NotificationSettingsContent.svelte
    ├── QuietHoursModal.svelte
    └── ThemeSection.svelte
```

**使用方式：**
```typescript
// Content Wrapper 組件
import { DashboardContent } from '$lib/modules/dashboard';
import { SubscriptionsContent, SubscriptionDetailContent } from '$lib/modules/subscriptions';
import { UsersContent, UserDetailContent } from '$lib/modules/users';
import { RolesContent, RoleDetailContent } from '$lib/modules/roles';
import { ProfileContent, SecurityContent } from '$lib/modules/account';
import { GeneralSettingsContent, NotificationSettingsContent } from '$lib/modules/settings';
import { LogsContent } from '$lib/modules/logs';
```

**設計準則：**
- 可包含業務邏輯和 API 調用
- 使用模組服務層處理數據
- 組合使用通用 UI 元件
- 僅在模組內部或通過公開導出使用

### Content Wrapper 模式

所有頁面採用 Content Wrapper 模式，將頁面 UI 封裝到獨立的 Content 組件中：

**頁面層職責：**
- 狀態管理 (`$state`, `$derived`)
- API 呼叫和資料載入
- 事件處理 (handleSubmit, handleDelete)
- Modal 狀態控制 (需要 `bind:open`)

**Content 組件職責：**
- UI 呈現和佈局
- 載入狀態 (skeleton)
- 表單和列表渲染
- 子組件組合

**範例實作：**
```svelte
<!-- +page.svelte (頁面層) -->
<script lang="ts">
  import { UserDetailContent } from '$lib/modules/users';

  let user = $state<User | null>(null);
  let loading = $state(true);
  let saving = $state(false);

  async function handleSubmit(event: Event) {
    saving = true;
    try {
      await usersApi.updateUser(user.id, formData);
      toast.success('已更新');
    } finally {
      saving = false;
    }
  }
</script>

<PageContainer title="編輯使用者">
  <UserDetailContent
    {user}
    {loading}
    {saving}
    {name}
    {email}
    onSubmit={handleSubmit}
    onCancel={() => goto('/settings/users')}
  />
</PageContainer>
```

### 選擇指南

| 情境 | 選擇 | 原因 |
|------|------|------|
| 按鈕、輸入框、表格 | 通用 UI 元件 | 無業務邏輯，高度重用 |
| 訂閱統計卡片 | 模組元件 | 使用 subscriptionsService 格式化 |
| 日誌詳情彈窗 | 模組元件 | 包含特定業務邏輯 |
| 通知篩選器 | 模組元件 | 與模組服務層耦合 |
| 載入指示器 | 通用 UI 元件 | 純視覺反饋 |
| 2FA 設定精靈 | 模組元件 | 複雜業務流程 |
| 分類支出明細 | 模組元件 | 訂閱分析專用元件 |
| 使用者篩選面板 | 模組元件 | 使用 usersService 格式化狀態 |
| 權限群組選擇器 | 模組元件 | 與 rolesService 耦合 |
| 主題選擇器 | 模組元件 | 使用 settingsService 管理偏好 |
| 靜音時段設定 | 模組元件 | 複雜表單邏輯 |

---

## 設計 Token

### 色彩系統

```css
/* src/app.css - CSS 變數定義 */
:root {
  /* Primary - 主要品牌色 */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* Neutral - 中性色 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* Semantic - 語意色彩 */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  --color-info-50: #eff6ff;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;

  /* Surface - 表面色 */
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f3f4f6;
  --color-border: #e5e7eb;
  --color-border-secondary: #d1d5db;
}

/* 深色模式 */
:root.dark {
  --color-surface: #111827;
  --color-surface-secondary: #1f2937;
  --color-surface-tertiary: #374151;
  --color-border: #374151;
  --color-border-secondary: #4b5563;
}
```

### Tailwind 配置

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
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)'
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans TC',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem'
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
};
```

---

## 基礎元件

### Button 按鈕

```svelte
<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import Spinner from './Spinner.svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    class?: string;
    children: Snippet;
    onclick?: (event: MouseEvent) => void;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    href,
    class: className = '',
    children,
    onclick
  }: Props = $props();

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium whitespace-nowrap
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
  `;

  const variants = {
    primary: `
      bg-primary-600 text-white
      hover:bg-primary-700 active:bg-primary-800
      focus-visible:ring-primary-500
    `,
    secondary: `
      bg-gray-100 text-gray-900
      hover:bg-gray-200 active:bg-gray-300
      focus-visible:ring-gray-500
      dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
    `,
    outline: `
      border border-gray-300 bg-transparent text-gray-700
      hover:bg-gray-50 active:bg-gray-100
      focus-visible:ring-gray-500
      dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800
    `,
    ghost: `
      bg-transparent text-gray-700
      hover:bg-gray-100 active:bg-gray-200
      focus-visible:ring-gray-500
      dark:text-gray-300 dark:hover:bg-gray-800
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700 active:bg-red-800
      focus-visible:ring-red-500
    `,
    link: `
      bg-transparent text-primary-600 underline-offset-4
      hover:underline
      focus-visible:ring-primary-500
    `
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md',
    md: 'h-10 px-4 text-sm rounded-md',
    lg: 'h-12 px-6 text-base rounded-lg',
    icon: 'h-10 w-10 rounded-md'
  };

  let computedClass = $derived(
    cn(baseStyles, variants[variant], sizes[size], className)
  );

  let isDisabled = $derived(disabled || loading);
</script>

{#if href && !isDisabled}
  <a {href} class={computedClass}>
    {@render children()}
  </a>
{:else}
  <button
    {type}
    class={computedClass}
    disabled={isDisabled}
    aria-disabled={isDisabled}
    {onclick}
  >
    {#if loading}
      <Spinner class="h-4 w-4" />
    {/if}
    {@render children()}
  </button>
{/if}
```

#### 使用範例

```svelte
<script>
  import { Button } from '$lib/components/ui';
</script>

<!-- 基本用法 -->
<Button>預設按鈕</Button>

<!-- 變體 -->
<Button variant="primary">主要按鈕</Button>
<Button variant="secondary">次要按鈕</Button>
<Button variant="outline">外框按鈕</Button>
<Button variant="ghost">幽靈按鈕</Button>
<Button variant="danger">危險按鈕</Button>

<!-- 尺寸 -->
<Button size="sm">小按鈕</Button>
<Button size="md">中按鈕</Button>
<Button size="lg">大按鈕</Button>

<!-- 狀態 -->
<Button loading>載入中</Button>
<Button disabled>已停用</Button>

<!-- 連結按鈕 -->
<Button href="/users">前往使用者頁面</Button>
```

---

### Badge 標籤

```svelte
<!-- src/lib/components/ui/Badge.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    size?: 'sm' | 'md';
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'default',
    size = 'md',
    class: className = '',
    children
  }: Props = $props();

  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };

  let computedClass = $derived(cn(baseStyles, variants[variant], sizes[size], className));
</script>

<span class={computedClass}>
  {@render children()}
</span>
```

---

### Card 卡片

```svelte
<!-- src/lib/components/ui/Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    variant?: 'default' | 'bordered' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
    class?: string;
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
  }

  let {
    variant = 'default',
    padding = 'md',
    hoverable = false,
    class: className = '',
    header,
    footer,
    children
  }: Props = $props();

  const baseStyles = 'rounded-lg overflow-hidden';

  const variants = {
    default: 'bg-white dark:bg-gray-900',
    bordered: 'bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700',
    elevated: 'bg-white shadow-md dark:bg-gray-900'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  let computedClass = $derived(
    cn(
      baseStyles,
      variants[variant],
      hoverable && 'transition-shadow hover:shadow-lg cursor-pointer',
      className
    )
  );
</script>

<div class={computedClass}>
  {#if header}
    <div class="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      {@render header()}
    </div>
  {/if}

  <div class={paddings[padding]}>
    {@render children()}
  </div>

  {#if footer}
    <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
      {@render footer()}
    </div>
  {/if}
</div>
```

---

## 表單元件

### Input 輸入框

```svelte
<!-- src/lib/components/ui/Input.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    name?: string;
    id?: string;
    value?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    class?: string;
    inputClass?: string;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onblur?: (event: FocusEvent) => void;
  }

  let {
    type = 'text',
    name,
    id,
    value = $bindable(''),
    placeholder,
    label,
    error,
    hint,
    disabled = false,
    required = false,
    readonly = false,
    class: className = '',
    inputClass = '',
    oninput,
    onchange,
    onblur
  }: Props = $props();

  let inputId = $derived(id || name || crypto.randomUUID());

  const baseInputStyles = `
    w-full px-3 py-2
    border rounded-md
    text-sm text-gray-900 placeholder-gray-400
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500
  `;

  let inputStyles = $derived(
    cn(
      baseInputStyles,
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600',
      inputClass
    )
  );
</script>

<div class={cn('space-y-1.5', className)}>
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <input
    {type}
    {name}
    id={inputId}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {readonly}
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
    class={inputStyles}
    {oninput}
    {onchange}
    {onblur}
  />

  {#if error}
    <p id="{inputId}-error" class="text-sm text-red-600 dark:text-red-400">
      {error}
    </p>
  {:else if hint}
    <p id="{inputId}-hint" class="text-sm text-gray-500 dark:text-gray-400">
      {hint}
    </p>
  {/if}
</div>
```

---

### Select 下拉選單

```svelte
<!-- src/lib/components/ui/Select.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    name?: string;
    id?: string;
    value?: string;
    options: Option[];
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    onchange?: (event: Event) => void;
  }

  let {
    name,
    id,
    value = $bindable(''),
    options,
    placeholder = '請選擇',
    label,
    error,
    disabled = false,
    required = false,
    class: className = '',
    onchange
  }: Props = $props();

  let selectId = $derived(id || name || crypto.randomUUID());

  const baseStyles = `
    w-full px-3 py-2 pr-10
    border rounded-md
    text-sm text-gray-900
    bg-white bg-no-repeat bg-right
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    dark:bg-gray-900 dark:text-gray-100
  `;

  let selectStyles = $derived(
    cn(
      baseStyles,
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600'
    )
  );
</script>

<div class={cn('space-y-1.5', className)}>
  {#if label}
    <label for={selectId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative">
    <select
      {name}
      id={selectId}
      bind:value
      {disabled}
      {required}
      aria-invalid={!!error}
      class={selectStyles}
      {onchange}
    >
      {#if placeholder}
        <option value="" disabled>{placeholder}</option>
      {/if}
      {#each options as option}
        <option value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      {/each}
    </select>

    <!-- 下拉箭頭圖示 -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  {#if error}
    <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
  {/if}
</div>
```

---

### Checkbox 核取方塊

```svelte
<!-- src/lib/components/ui/Checkbox.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    name?: string;
    id?: string;
    checked?: boolean;
    label?: string;
    description?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (event: Event) => void;
  }

  let {
    name,
    id,
    checked = $bindable(false),
    label,
    description,
    disabled = false,
    class: className = '',
    onchange
  }: Props = $props();

  let checkboxId = $derived(id || name || crypto.randomUUID());

  const checkboxStyles = `
    h-4 w-4 rounded
    border-gray-300 text-primary-600
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    dark:border-gray-600 dark:bg-gray-900
  `;
</script>

<div class={cn('flex items-start gap-3', className)}>
  <input
    type="checkbox"
    {name}
    id={checkboxId}
    bind:checked
    {disabled}
    class={checkboxStyles}
    {onchange}
  />

  {#if label || description}
    <div class="flex flex-col">
      {#if label}
        <label
          for={checkboxId}
          class="text-sm font-medium text-gray-700 dark:text-gray-300"
          class:cursor-not-allowed={disabled}
          class:opacity-50={disabled}
        >
          {label}
        </label>
      {/if}
      {#if description}
        <p class="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {/if}
    </div>
  {/if}
</div>
```

---

## 資料展示元件

### DataTable 資料表格

```svelte
<!-- src/lib/components/ui/DataTable.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: Snippet<[T]>;
  }

  interface Props<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    onRowClick?: (row: T) => void;
    class?: string;
  }

  let {
    data,
    columns,
    loading = false,
    emptyMessage = '沒有資料',
    sortColumn,
    sortDirection = 'asc',
    onSort,
    onRowClick,
    class: className = ''
  }: Props<T> = $props();

  function handleSort(column: Column<T>) {
    if (!column.sortable || !onSort) return;

    const key = column.key as string;
    const newDirection = sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  }

  function getCellValue(row: T, key: keyof T | string): unknown {
    return (row as Record<string, unknown>)[key as string];
  }
</script>

<div class={cn('overflow-x-auto', className)}>
  <table class="w-full text-sm">
    <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <tr>
        {#each columns as column}
          <th
            class={cn(
              'px-4 py-3 font-medium text-gray-700 dark:text-gray-300',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            style={column.width ? `width: ${column.width}` : undefined}
            onclick={() => handleSort(column)}
          >
            <div class="flex items-center gap-2" class:justify-center={column.align === 'center'} class:justify-end={column.align === 'right'}>
              {column.header}
              {#if column.sortable}
                <span class="text-gray-400">
                  {#if sortColumn === column.key}
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  {:else}
                    ↕
                  {/if}
                </span>
              {/if}
            </div>
          </th>
        {/each}
      </tr>
    </thead>

    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      {#if loading}
        <tr>
          <td colspan={columns.length} class="px-4 py-12 text-center">
            <div class="flex items-center justify-center gap-2 text-gray-500">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              載入中...
            </div>
          </td>
        </tr>
      {:else if data.length === 0}
        <tr>
          <td colspan={columns.length} class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as row, index}
          <tr
            class={cn(
              'bg-white dark:bg-gray-900',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              onRowClick && 'cursor-pointer'
            )}
            onclick={() => onRowClick?.(row)}
          >
            {#each columns as column}
              <td
                class={cn(
                  'px-4 py-3 text-gray-900 dark:text-gray-100',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {#if column.render}
                  {@render column.render(row)}
                {:else}
                  {getCellValue(row, column.key)}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
```

---

### Pagination 分頁

```svelte
<!-- src/lib/components/ui/Pagination.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils';
  import Button from './Button.svelte';

  interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    class?: string;
  }

  let {
    page,
    pageSize,
    total,
    onPageChange,
    class: className = ''
  }: Props = $props();

  let totalPages = $derived(Math.ceil(total / pageSize));
  let hasPrev = $derived(page > 1);
  let hasNext = $derived(page < totalPages);

  let visiblePages = $derived(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  });

  let startItem = $derived((page - 1) * pageSize + 1);
  let endItem = $derived(Math.min(page * pageSize, total));
</script>

<div class={cn('flex items-center justify-between', className)}>
  <p class="text-sm text-gray-700 dark:text-gray-300">
    顯示第 <span class="font-medium">{startItem}</span> 至
    <span class="font-medium">{endItem}</span> 項，共
    <span class="font-medium">{total}</span> 項
  </p>

  <nav class="flex items-center gap-1">
    <Button
      variant="outline"
      size="sm"
      disabled={!hasPrev}
      onclick={() => onPageChange(page - 1)}
    >
      上一頁
    </Button>

    {#each visiblePages() as p}
      {#if p === 'ellipsis'}
        <span class="px-2 text-gray-500">...</span>
      {:else}
        <Button
          variant={p === page ? 'primary' : 'ghost'}
          size="sm"
          onclick={() => onPageChange(p)}
        >
          {p}
        </Button>
      {/if}
    {/each}

    <Button
      variant="outline"
      size="sm"
      disabled={!hasNext}
      onclick={() => onPageChange(page + 1)}
    >
      下一頁
    </Button>
  </nav>
</div>
```

---

## 佈局元件

### Sidebar 側邊欄

```svelte
<!-- src/lib/components/layout/Sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';
  import { ui } from '$lib/stores/ui';

  interface NavItem {
    label: string;
    href: string;
    icon?: string;
    badge?: string | number;
    children?: NavItem[];
  }

  interface Props {
    items: NavItem[];
    class?: string;
  }

  let { items, class: className = '' }: Props = $props();

  function isActive(href: string): boolean {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }
</script>

<aside
  class={cn(
    'fixed left-0 top-0 z-40 h-screen w-64',
    'bg-white dark:bg-gray-900',
    'border-r border-gray-200 dark:border-gray-700',
    'transition-transform duration-300',
    !$ui.sidebarOpen && '-translate-x-full lg:translate-x-0',
    className
  )}
>
  <!-- Logo -->
  <div class="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
    <a href="/" class="flex items-center gap-2">
      <span class="text-xl font-bold text-primary-600">Admin</span>
    </a>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto p-4">
    <ul class="space-y-1">
      {#each items as item}
        <li>
          <a
            href={item.href}
            class={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
              'transition-colors duration-200',
              isActive(item.href)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {#if item.icon}
              <span class="w-5 h-5">{@html item.icon}</span>
            {/if}
            <span class="flex-1">{item.label}</span>
            {#if item.badge}
              <span class="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {item.badge}
              </span>
            {/if}
          </a>

          {#if item.children && isActive(item.href)}
            <ul class="mt-1 ml-8 space-y-1">
              {#each item.children as child}
                <li>
                  <a
                    href={child.href}
                    class={cn(
                      'block px-3 py-1.5 rounded-md text-sm',
                      'transition-colors duration-200',
                      isActive(child.href)
                        ? 'text-primary-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    )}
                  >
                    {child.label}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>
</aside>
```

---

## 回饋元件

### Modal 對話框

```svelte
<!-- src/lib/components/ui/Modal.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { fade, scale } from 'svelte/transition';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
    class?: string;
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
    onClose?: () => void;
  }

  let {
    open = $bindable(false),
    title,
    size = 'md',
    closable = true,
    class: className = '',
    header,
    footer,
    children,
    onClose
  }: Props = $props();

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl'
  };

  function handleClose() {
    if (closable) {
      open = false;
      onClose?.();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closable) {
      handleClose();
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    <!-- Modal -->
    <div
      class={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl',
        sizes[size],
        className
      )}
      transition:scale={{ duration: 200, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      {#if header || title}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {#if header}
            {@render header()}
          {:else if title}
            <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          {/if}

          {#if closable}
            <button
              type="button"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              onclick={handleClose}
              aria-label="關閉"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <!-- Body -->
      <div class="px-6 py-4">
        {@render children()}
      </div>

      <!-- Footer -->
      {#if footer}
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
```

---

### Toast 通知

```svelte
<!-- src/lib/components/ui/Toast.svelte -->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { cn } from '$lib/utils';
  import { toast, type ToastItem } from '$lib/stores/toast';

  const icons = {
    success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
    error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
    warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
    info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  };

  const styles = {
    success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  };

  let toasts: ToastItem[] = [];
  toast.subscribe(items => toasts = items);
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
  {#each toasts as item (item.id)}
    <div
      class={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg',
        styles[item.type]
      )}
      in:fly={{ x: 50, duration: 200 }}
      out:fly={{ x: 50, duration: 200 }}
      animate:flip={{ duration: 200 }}
    >
      <span class="flex-shrink-0">
        {@html icons[item.type]}
      </span>
      <p class="flex-1 text-sm font-medium">{item.message}</p>
      <button
        type="button"
        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        onclick={() => toast.dismiss(item.id)}
        aria-label="關閉"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>
```

### Toast Store

```typescript
// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([]);

  function add(item: Omit<ToastItem, 'id'>) {
    const id = crypto.randomUUID();
    const toast: ToastItem = { ...item, id };

    update(toasts => [...toasts, toast]);

    if (item.duration !== 0) {
      setTimeout(() => dismiss(id), item.duration || 5000);
    }

    return id;
  }

  function dismiss(id: string) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  function clear() {
    update(() => []);
  }

  return {
    subscribe,
    success: (message: string, duration?: number) => add({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => add({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) => add({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) => add({ type: 'info', message, duration }),
    dismiss,
    clear
  };
}

export const toast = createToastStore();
```

---

## 響應式設計

### 斷點系統

| 斷點 | 最小寬度 | 說明 |
|------|---------|------|
| `sm` | 640px | 小型平板 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 桌面 |
| `xl` | 1280px | 大螢幕 |
| `2xl` | 1536px | 超大螢幕 |

### 響應式工具

```typescript
// src/lib/utils/responsive.ts
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const screenSize = readable<Breakpoint | 'xs'>('xs', (set) => {
  if (!browser) return;

  function update() {
    const width = window.innerWidth;

    if (width >= breakpoints['2xl']) set('2xl');
    else if (width >= breakpoints.xl) set('xl');
    else if (width >= breakpoints.lg) set('lg');
    else if (width >= breakpoints.md) set('md');
    else if (width >= breakpoints.sm) set('sm');
    else set('xs');
  }

  update();
  window.addEventListener('resize', update);

  return () => window.removeEventListener('resize', update);
});

export function isMobile(): boolean {
  if (!browser) return false;
  return window.innerWidth < breakpoints.md;
}

export function isTablet(): boolean {
  if (!browser) return false;
  const width = window.innerWidth;
  return width >= breakpoints.md && width < breakpoints.lg;
}

export function isDesktop(): boolean {
  if (!browser) return false;
  return window.innerWidth >= breakpoints.lg;
}
```

---

## 動畫規範

### 動畫持續時間

| 類型 | 持續時間 | 用途 |
|------|---------|------|
| 快速 | 150ms | 微互動（hover、focus） |
| 標準 | 200ms | 一般過渡 |
| 強調 | 300ms | 進場/退場動畫 |
| 緩慢 | 500ms | 複雜動畫 |

### Svelte 過渡效果

```svelte
<script>
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

<!-- 淡入淡出 -->
<div transition:fade={{ duration: 200 }}>
  內容
</div>

<!-- 飛入效果 -->
<div in:fly={{ y: 20, duration: 300, easing: quintOut }}>
  內容
</div>

<!-- 滑動效果 -->
<div transition:slide={{ duration: 300 }}>
  內容
</div>

<!-- 縮放效果 -->
<div transition:scale={{ start: 0.95, duration: 200 }}>
  內容
</div>
```

---

## 元件測試

### 測試設置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
});
```

### 測試範例

```typescript
// tests/unit/components/Button.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button', () => {
  it('renders children correctly', () => {
    render(Button, {
      props: { children: () => '按鈕文字' }
    });

    expect(screen.getByRole('button')).toHaveTextContent('按鈕文字');
  });

  it('applies variant styles', () => {
    const { container } = render(Button, {
      props: { variant: 'danger', children: () => '刪除' }
    });

    expect(container.querySelector('button')).toHaveClass('bg-red-600');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();

    render(Button, {
      props: {
        children: () => '點擊我',
        onclick: handleClick
      }
    });

    await fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('prevents click when disabled', async () => {
    const handleClick = vi.fn();

    render(Button, {
      props: {
        children: () => '停用按鈕',
        onclick: handleClick,
        disabled: true
      }
    });

    await fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

---

## 附錄

### 相關文檔

- [01-專案架構文檔](./01-專案架構文檔.md)
- [02-開發規範指南](./02-開發規範指南.md)
- [03-API整合規範](./03-API整合規範.md)
- [05-部署與建置指南](./05-部署與建置指南.md)

### 元件清單

| 類別 | 元件 | 狀態 |
|------|------|------|
| 基礎 | Button, Badge, Card | 設計完成 |
| 表單 | Input, Select, Checkbox | 設計完成 |
| 資料展示 | DataTable, Pagination | 設計完成 |
| 佈局 | Sidebar, Header | 設計完成 |
| 回饋 | Modal, Toast | 設計完成 |

### 圖示庫建議

- [Heroicons](https://heroicons.com/) - Tailwind CSS 官方圖示
- [Lucide](https://lucide.dev/) - 現代化圖示庫
- [Phosphor](https://phosphoricons.com/) - 靈活的圖示系統
