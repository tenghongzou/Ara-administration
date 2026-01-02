# Development Guide

This document covers coding standards, naming conventions, Svelte 5 best practices, and development workflow for Ara Administration.

---

## Naming Conventions

### Files & Directories

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.svelte` |
| Pages | +page.svelte | `+page.svelte` |
| Stores | camelCase | `authStore.ts` |
| Services | camelCase | `userService.ts` |
| Types | camelCase | `types.ts` |
| Utilities | camelCase | `formatDate.ts` |

### Code

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Functions | camelCase | `handleSubmit` |
| Types/Interfaces | PascalCase | `UserResponse` |
| Enums | PascalCase | `UserStatus` |

---

## TypeScript Guidelines

### Strict Mode

All files must be strictly typed:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Definitions

Define types in dedicated files:

```typescript
// src/lib/types/models.ts
export interface User {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
```

### Avoid `any`

Use proper types instead of `any`:

```typescript
// Bad
function processData(data: any) { ... }

// Good
function processData(data: unknown) { ... }
function processData<T extends Record<string, unknown>>(data: T) { ... }
```

---

## Svelte 5 Best Practices

### Runes API

Use the new Runes API for reactivity:

```svelte
<script lang="ts">
  // State
  let count = $state(0);
  let items = $state<string[]>([]);

  // Derived values
  let doubled = $derived(count * 2);
  let itemCount = $derived(items.length);

  // Effects
  $effect(() => {
    console.log('Count changed:', count);
  });

  // Cleanup in effects
  $effect(() => {
    const interval = setInterval(() => {
      count++;
    }, 1000);

    return () => clearInterval(interval);
  });
</script>
```

### Props

Use `$props()` for component props:

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
    onAction?: () => void;
  }

  let { title, count = 0, onAction } = $props<Props>();
</script>
```

### Bindable Props

Use `$bindable()` for two-way binding:

```svelte
<script lang="ts">
  interface Props {
    value: string;
  }

  let { value = $bindable() } = $props<Props>();
</script>

<input bind:value />
```

### Snippets

Use snippets for reusable content:

```svelte
{#snippet item(text: string)}
  <li class="item">{text}</li>
{/snippet}

<ul>
  {#each items as item}
    {@render item(item)}
  {/each}
</ul>
```

---

## Component Guidelines

### Component Structure

```svelte
<script lang="ts">
  // 1. Imports
  import { Button } from '$components/ui';

  // 2. Types
  interface Props {
    title: string;
  }

  // 3. Props
  let { title } = $props<Props>();

  // 4. State
  let isOpen = $state(false);

  // 5. Derived
  let displayTitle = $derived(title.toUpperCase());

  // 6. Effects
  $effect(() => {
    // Side effects
  });

  // 7. Functions
  function handleClick() {
    isOpen = !isOpen;
  }
</script>

<!-- Template -->
<div class="component">
  <h1>{displayTitle}</h1>
  <Button onclick={handleClick}>Toggle</Button>
</div>

<style>
  /* Scoped styles */
  .component {
    padding: 1rem;
  }
</style>
```

### Event Handling

Use `on` prefix for event handlers:

```svelte
<script lang="ts">
  interface Props {
    onSubmit?: (data: FormData) => void;
    onClick?: () => void;
  }

  let { onSubmit, onClick } = $props<Props>();
</script>

<button onclick={onClick}>Click</button>
```

### Conditional Rendering

```svelte
{#if condition}
  <div>Shown when true</div>
{:else if otherCondition}
  <div>Alternative</div>
{:else}
  <div>Default</div>
{/if}
```

### List Rendering

Always use keys for lists:

```svelte
{#each items as item (item.id)}
  <ListItem {item} />
{/each}
```

---

## Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes:

```svelte
<div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
  <span class="text-lg font-medium text-gray-900 dark:text-white">
    {title}
  </span>
</div>
```

### Class Merging

Use `cn()` utility for conditional classes:

```svelte
<script lang="ts">
  import { cn } from '$utils';

  let { variant = 'primary', className } = $props<Props>();
</script>

<button
  class={cn(
    'px-4 py-2 rounded-md font-medium',
    variant === 'primary' && 'bg-blue-500 text-white',
    variant === 'secondary' && 'bg-gray-200 text-gray-900',
    className
  )}
>
  <slot />
</button>
```

### Dark Mode

Support dark mode with Tailwind's dark: prefix:

```svelte
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

---

## Service Layer

### API Service Pattern

```typescript
// src/lib/services/users/api.ts
import { apiClient } from '$services/core/api-client';
import type { User, CreateUserRequest } from '$types';

export const userService = {
  async list(params?: ListParams): Promise<PaginatedResponse<User>> {
    return apiClient.get('/users', { params });
  },

  async getById(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`);
  },

  async create(data: CreateUserRequest): Promise<User> {
    return apiClient.post('/users', data);
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    return apiClient.put(`/users/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },
};
```

---

## Testing

### Unit Tests

```typescript
// tests/unit/components/Button.test.ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Button from '$components/ui/Button.svelte';

describe('Button', () => {
  it('renders with correct text', () => {
    render(Button, { props: { children: 'Click me' } });
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(Button, { props: { onclick: onClick } });

    await fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Tests

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

---

## Git Workflow

### Branch Naming

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/user-avatar` |
| `fix/` | Bug fixes | `fix/login-validation` |
| `refactor/` | Refactoring | `refactor/auth-store` |
| `docs/` | Documentation | `docs/api-guide` |

### Commit Messages

Use conventional commits:

```
feat(subscriptions): add calendar view
fix(auth): resolve token refresh issue
docs(readme): update installation steps
refactor(components): extract common button styles
```

---

## Related Documentation

- [Architecture](./01-architecture.md)
- [API Integration](./03-api-integration.md)
- [Component Design](./04-component-design.md)
