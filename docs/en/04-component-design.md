# Component Design

This document covers the UI component library, design system, design tokens, and component patterns for Ara Administration.

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Component Organization](#component-organization)
3. [Design Tokens](#design-tokens)
4. [Base Components](#base-components)
5. [Form Components](#form-components)
6. [Data Display Components](#data-display-components)
7. [Layout Components](#layout-components)
8. [Feedback Components](#feedback-components)
9. [Responsive Design](#responsive-design)
10. [Animation Guidelines](#animation-guidelines)
11. [Component Testing](#component-testing)

---

## Design System Overview

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Consistency** | All components follow unified visual language and interaction patterns |
| **Accessibility** | WCAG 2.1 AA compliant, keyboard navigation and screen reader support |
| **Composability** | Components can be freely combined for various use cases |
| **Extensibility** | Flexible customization through props and snippets |
| **Performance** | Minimize bundle size, optimize rendering performance |

### Design References

- Google Material Design 3
- Microsoft Fluent Design
- Stripe Dashboard
- Linear App

---

## Component Organization

Components are organized into two categories: **Generic UI Components** and **Feature Module Components**.

### Generic UI Components

Located in `src/lib/components/ui/`, providing reusable base components.

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

**Usage:**
```typescript
import { Button, Modal, DataTable } from '$lib/components/ui';
```

**Guidelines:**
- No business logic, pure UI presentation
- Highly configurable via props
- Support Snippets for slot extension
- Accessibility compliant

### Feature Module Components

Located in `src/lib/modules/{module}/components/`, containing business-specific logic.

**Module Component Structure:**
```
src/lib/modules/{module}/components/
├── {Module}Content.svelte      # Page content (Content Wrapper)
├── {Module}DetailContent.svelte # Detail page content
├── {Module}DataGrid.svelte     # Data table
├── {Module}Form.svelte         # Form component
├── {Module}Filters.svelte      # Filter panel
└── {Module}Modal.svelte        # Dialog
```

**Usage:**
```typescript
// Content Wrapper components
import { DashboardContent } from '$lib/modules/dashboard';
import { SubscriptionsContent, SubscriptionDetailContent } from '$lib/modules/subscriptions';
import { UsersContent, UserDetailContent } from '$lib/modules/users';
import { RolesContent, RoleDetailContent } from '$lib/modules/roles';
import { ProfileContent, SecurityContent } from '$lib/modules/account';
import { GeneralSettingsContent, NotificationSettingsContent } from '$lib/modules/settings';
import { LogsContent } from '$lib/modules/logs';
```

**Guidelines:**
- May contain business logic and API calls
- Use module service layer for data handling
- Compose using generic UI components
- Only used within module or via public exports

### Content Wrapper Pattern

All pages use the Content Wrapper pattern, encapsulating page UI into separate Content components:

**Page Layer Responsibilities:**
- State management (`$state`, `$derived`)
- API calls and data loading
- Event handling (handleSubmit, handleDelete)
- Modal state control (requires `bind:open`)

**Content Component Responsibilities:**
- UI presentation and layout
- Loading states (skeleton)
- Form and list rendering
- Child component composition

**Example Implementation:**
```svelte
<!-- +page.svelte (Page layer) -->
<script lang="ts">
  import { UserDetailContent } from '$lib/modules/users';

  let user = $state<User | null>(null);
  let loading = $state(true);
  let saving = $state(false);

  async function handleSubmit(event: Event) {
    saving = true;
    try {
      await usersApi.updateUser(user.id, formData);
      toast.success('Updated');
    } finally {
      saving = false;
    }
  }
</script>

<PageContainer title="Edit User">
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

### Selection Guide

| Scenario | Choice | Reason |
|----------|--------|--------|
| Button, Input, Table | Generic UI | No business logic, highly reusable |
| Subscription stats card | Module component | Uses subscriptionsService for formatting |
| Log detail modal | Module component | Contains specific business logic |
| Notification filter | Module component | Coupled with module service layer |
| Loading indicator | Generic UI | Pure visual feedback |
| 2FA setup wizard | Module component | Complex business flow |

---

## Design Tokens

### Color System

```css
/* src/app.css - CSS Variables */
:root {
  /* Primary - Brand color */
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

  /* Neutral */
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

  /* Semantic Colors */
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

  /* Surface */
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f3f4f6;
  --color-border: #e5e7eb;
  --color-border-secondary: #d1d5db;
}

/* Dark Mode */
:root.dark {
  --color-surface: #111827;
  --color-surface-secondary: #1f2937;
  --color-surface-tertiary: #374151;
  --color-border: #374151;
  --color-border-secondary: #4b5563;
}
```

### Tailwind Configuration

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
          // ... full scale
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }]
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem'
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'md': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'lg': '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out'
      }
    }
  },
  plugins: []
};
```

---

## Base Components

### Button

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

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    link: 'bg-transparent text-primary-600 hover:underline'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md',
    md: 'h-10 px-4 text-sm rounded-md',
    lg: 'h-12 px-6 text-base rounded-lg',
    icon: 'h-10 w-10 rounded-md'
  };
</script>

{#if href && !isDisabled}
  <a {href} class={cn(baseStyles, variants[variant], sizes[size], className)}>
    {@render children()}
  </a>
{:else}
  <button {type} class={computedClass} disabled={isDisabled} {onclick}>
    {#if loading}<Spinner class="h-4 w-4" />{/if}
    {@render children()}
  </button>
{/if}
```

#### Usage Examples

```svelte
<!-- Basic -->
<Button>Default Button</Button>

<!-- Variants -->
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

<!-- Sizes -->
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

<!-- States -->
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>

<!-- Link Button -->
<Button href="/users">Go to Users</Button>
```

---

### Badge

```svelte
<!-- src/lib/components/ui/Badge.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    size?: 'sm' | 'md';
    class?: string;
    children: Snippet;
  }

  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
  };
</script>

<span class={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size], className)}>
  {@render children()}
</span>
```

---

### Card

```svelte
<!-- src/lib/components/ui/Card.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'default' | 'bordered' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
    class?: string;
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
  }

  const variants = {
    default: 'bg-white dark:bg-gray-900',
    bordered: 'bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700',
    elevated: 'bg-white shadow-md dark:bg-gray-900'
  };
</script>

<div class={cn('rounded-lg overflow-hidden', variants[variant], hoverable && 'hover:shadow-lg', className)}>
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

## Form Components

### Input

```svelte
<!-- src/lib/components/ui/Input.svelte -->
<script lang="ts">
  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    name?: string;
    value?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
  }

  let { value = $bindable(''), label, error, hint, disabled, required }: Props = $props();
</script>

<div class={cn('space-y-1.5', className)}>
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {#if required}<span class="text-red-500">*</span>{/if}
    </label>
  {/if}

  <input
    {type}
    bind:value
    class={cn(
      'w-full px-3 py-2 border rounded-md text-sm',
      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
    )}
    aria-invalid={!!error}
  />

  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {:else if hint}
    <p class="text-sm text-gray-500">{hint}</p>
  {/if}
</div>
```

---

### Select

```svelte
<!-- src/lib/components/ui/Select.svelte -->
<script lang="ts">
  interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    value?: string;
    options: Option[];
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
  }

  let { value = $bindable(''), options, placeholder = 'Select', label }: Props = $props();
</script>

<div class={cn('space-y-1.5', className)}>
  {#if label}
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
  {/if}

  <select bind:value class={selectStyles}>
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    {/each}
  </select>

  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>
```

---

### Checkbox

```svelte
<!-- src/lib/components/ui/Checkbox.svelte -->
<script lang="ts">
  interface Props {
    checked?: boolean;
    label?: string;
    description?: string;
    disabled?: boolean;
  }

  let { checked = $bindable(false), label, description, disabled }: Props = $props();
</script>

<div class={cn('flex items-start gap-3', className)}>
  <input
    type="checkbox"
    bind:checked
    {disabled}
    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
  />

  {#if label || description}
    <div class="flex flex-col">
      {#if label}
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
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

## Data Display Components

### DataTable

```svelte
<!-- src/lib/components/ui/DataTable.svelte -->
<script lang="ts" generics="T">
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
  }
</script>

<div class={cn('overflow-x-auto', className)}>
  <table class="w-full text-sm">
    <thead class="bg-gray-50 dark:bg-gray-800 border-b">
      <tr>
        {#each columns as column}
          <th
            class={cn('px-4 py-3 font-medium', column.sortable && 'cursor-pointer')}
            onclick={() => handleSort(column)}
          >
            {column.header}
            {#if column.sortable}
              <span class="text-gray-400">
                {sortColumn === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>

    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      {#if loading}
        <tr>
          <td colspan={columns.length} class="px-4 py-12 text-center">
            Loading...
          </td>
        </tr>
      {:else if data.length === 0}
        <tr>
          <td colspan={columns.length} class="px-4 py-12 text-center text-gray-500">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as row}
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-800" onclick={() => onRowClick?.(row)}>
            {#each columns as column}
              <td class="px-4 py-3">
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

### Pagination

```svelte
<!-- src/lib/components/ui/Pagination.svelte -->
<script lang="ts">
  interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  }

  let { page, pageSize, total, onPageChange }: Props = $props();

  let totalPages = $derived(Math.ceil(total / pageSize));
  let hasPrev = $derived(page > 1);
  let hasNext = $derived(page < totalPages);
  let startItem = $derived((page - 1) * pageSize + 1);
  let endItem = $derived(Math.min(page * pageSize, total));
</script>

<div class="flex items-center justify-between">
  <p class="text-sm text-gray-700 dark:text-gray-300">
    Showing <span class="font-medium">{startItem}</span> to
    <span class="font-medium">{endItem}</span> of
    <span class="font-medium">{total}</span> results
  </p>

  <nav class="flex items-center gap-1">
    <Button variant="outline" size="sm" disabled={!hasPrev} onclick={() => onPageChange(page - 1)}>
      Previous
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

    <Button variant="outline" size="sm" disabled={!hasNext} onclick={() => onPageChange(page + 1)}>
      Next
    </Button>
  </nav>
</div>
```

---

## Layout Components

### Sidebar

```svelte
<!-- src/lib/components/layout/Sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
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
  }

  function isActive(href: string): boolean {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }
</script>

<aside
  class={cn(
    'fixed left-0 top-0 z-40 h-screen w-64',
    'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
    'transition-transform duration-300',
    !$ui.sidebarOpen && '-translate-x-full lg:translate-x-0'
  )}
>
  <!-- Logo -->
  <div class="flex items-center h-16 px-6 border-b">
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
              isActive(item.href)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <span class="flex-1">{item.label}</span>
            {#if item.badge}
              <span class="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                {item.badge}
              </span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</aside>
```

---

## Feedback Components

### Modal

```svelte
<!-- src/lib/components/ui/Modal.svelte -->
<script lang="ts">
  import { fade, scale } from 'svelte/transition';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
    onClose?: () => void;
  }

  let { open = $bindable(false), title, size = 'md', closable = true }: Props = $props();

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
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && handleClose()} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    transition:fade={{ duration: 200 }}
    onclick={(e) => e.target === e.currentTarget && handleClose()}
    role="dialog"
    aria-modal="true"
  >
    <div
      class={cn('w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl', sizes[size])}
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Header -->
      {#if header || title}
        <div class="flex items-center justify-between px-6 py-4 border-b">
          {#if header}
            {@render header()}
          {:else if title}
            <h2 class="text-lg font-semibold">{title}</h2>
          {/if}

          {#if closable}
            <button onclick={handleClose} aria-label="Close">
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
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
```

---

### Toast

```svelte
<!-- src/lib/components/ui/Toast.svelte -->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { toast, type ToastItem } from '$lib/stores/toast';

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
      class={cn('flex items-start gap-3 p-4 rounded-lg shadow-lg', styles[item.type])}
      in:fly={{ x: 50, duration: 200 }}
      out:fly={{ x: 50, duration: 200 }}
      animate:flip={{ duration: 200 }}
    >
      <p class="flex-1 text-sm font-medium">{item.message}</p>
      <button onclick={() => toast.dismiss(item.id)} aria-label="Close">
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

  return {
    subscribe,
    success: (message: string, duration?: number) => add({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => add({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) => add({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) => add({ type: 'info', message, duration }),
    dismiss
  };
}

export const toast = createToastStore();
```

---

## Responsive Design

### Breakpoint System

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large screens |
| `2xl` | 1536px | Extra large screens |

### Responsive Utilities

```typescript
// src/lib/utils/responsive.ts
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<Breakpoint, number> = {
  sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536
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

export function isDesktop(): boolean {
  if (!browser) return false;
  return window.innerWidth >= breakpoints.lg;
}
```

---

## Animation Guidelines

### Duration Scale

| Type | Duration | Usage |
|------|----------|-------|
| Fast | 150ms | Micro-interactions (hover, focus) |
| Standard | 200ms | General transitions |
| Emphasis | 300ms | Entry/exit animations |
| Slow | 500ms | Complex animations |

### Svelte Transitions

```svelte
<script>
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

<!-- Fade -->
<div transition:fade={{ duration: 200 }}>
  Content
</div>

<!-- Fly in -->
<div in:fly={{ y: 20, duration: 300, easing: quintOut }}>
  Content
</div>

<!-- Slide -->
<div transition:slide={{ duration: 300 }}>
  Content
</div>

<!-- Scale -->
<div transition:scale={{ start: 0.95, duration: 200 }}>
  Content
</div>
```

---

## Component Testing

### Test Setup

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

### Test Example

```typescript
// tests/unit/components/Button.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button', () => {
  it('renders children correctly', () => {
    render(Button, { props: { children: () => 'Button Text' } });
    expect(screen.getByRole('button')).toHaveTextContent('Button Text');
  });

  it('applies variant styles', () => {
    const { container } = render(Button, {
      props: { variant: 'danger', children: () => 'Delete' }
    });
    expect(container.querySelector('button')).toHaveClass('bg-red-600');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(Button, {
      props: { children: () => 'Click me', onclick: handleClick }
    });

    await fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('prevents click when disabled', async () => {
    const handleClick = vi.fn();
    render(Button, {
      props: { children: () => 'Disabled', onclick: handleClick, disabled: true }
    });

    await fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

---

## Related Documentation

- [Architecture](./01-architecture.md)
- [Development Guide](./02-development-guide.md)
- [API Integration](./03-api-integration.md)
- [Deployment Guide](./05-deployment-guide.md)

