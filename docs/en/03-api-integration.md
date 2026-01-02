# API Integration

This document covers API client design, authentication mechanisms, service layer patterns, and error handling for Ara Administration.

---

## API Client

### Base Configuration

The API client is configured in `src/lib/services/core/api-client.ts`:

```typescript
const API_BASE = `${import.meta.env.VITE_API_HOST}/api/${import.meta.env.VITE_API_VERSION}`;

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private getHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body: data });
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body: data });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export const apiClient = new ApiClient(API_BASE);
```

### Request/Response Handling

```typescript
private async request<T>(
  method: string,
  path: string,
  options?: RequestOptions
): Promise<T> {
  const url = new URL(path, this.baseUrl);

  // Add query parameters
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: this.getHeaders(),
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw await this.handleError(response);
  }

  const json = await response.json();
  return json.data ?? json;
}
```

---

## Authentication

### Token Management

```typescript
// src/lib/stores/auth.ts
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(getInitialState());

  return {
    subscribe,

    async login(credentials: LoginCredentials) {
      const response = await authService.login(credentials);

      localStorage.setItem('access_token', response.token);

      update((state) => ({
        ...state,
        user: response.user,
        token: response.token,
        permissions: response.permissions,
      }));

      return response;
    },

    logout() {
      localStorage.removeItem('access_token');
      set(getInitialState());
    },

    async refreshToken() {
      try {
        const response = await authService.refresh();
        localStorage.setItem('access_token', response.token);
        update((state) => ({ ...state, token: response.token }));
      } catch {
        this.logout();
      }
    },
  };
}
```

### Auto Token Refresh

```typescript
// Handle 401 responses
private async handleError(response: Response): Promise<ApiError> {
  if (response.status === 401) {
    // Try to refresh token
    try {
      await authStore.refreshToken();
      // Retry original request
      return this.retryRequest();
    } catch {
      authStore.logout();
      window.location.href = '/login';
    }
  }

  const error = await response.json();
  return new ApiError(error.message, response.status, error.code);
}
```

---

## Service Layer

### Service Pattern

Each feature has its own service module:

```typescript
// src/lib/services/subscriptions/api.ts
import { apiClient } from '$services/core/api-client';
import type {
  Subscription,
  CreateSubscriptionRequest,
  SubscriptionListParams,
  SubscriptionStats,
} from '$types';

export const subscriptionService = {
  async list(params?: SubscriptionListParams) {
    return apiClient.get<PaginatedResponse<Subscription>>('/subscriptions', { params });
  },

  async getById(id: string) {
    return apiClient.get<Subscription>(`/subscriptions/${id}`);
  },

  async create(data: CreateSubscriptionRequest) {
    return apiClient.post<Subscription>('/subscriptions', data);
  },

  async update(id: string, data: Partial<Subscription>) {
    return apiClient.put<Subscription>(`/subscriptions/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete(`/subscriptions/${id}`);
  },

  async getStats() {
    return apiClient.get<SubscriptionStats>('/subscriptions/stats');
  },

  async getUpcoming(days = 7) {
    return apiClient.get<Subscription[]>('/subscriptions/upcoming', {
      params: { days },
    });
  },
};
```

### Type Definitions

```typescript
// src/lib/types/api.ts
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  errors?: Record<string, string[]>;
}

// src/lib/types/models.ts
export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionCategory =
  | 'streaming'
  | 'software'
  | 'gaming'
  | 'music'
  | 'cloud'
  | 'productivity';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'paused'
  | 'trial'
  | 'expired';
```

---

## SvelteKit Data Loading

### Server Load Functions

```typescript
// src/routes/(app)/subscriptions/+page.server.ts
import type { PageServerLoad } from './$types';
import { subscriptionService } from '$services/subscriptions';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const category = url.searchParams.get('category');

  const subscriptions = await subscriptionService.list({ page, category });

  return {
    subscriptions,
  };
};
```

### Client-side Loading

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { subscriptionService } from '$services/subscriptions';
  import { onMount } from 'svelte';

  let subscriptions = $state<Subscription[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const response = await subscriptionService.list();
      subscriptions = response.data;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <Spinner />
{:else if error}
  <ErrorMessage message={error} />
{:else}
  <SubscriptionList {subscriptions} />
{/if}
```

---

## Form Handling

### Form Validation with Zod

```typescript
// src/lib/modules/subscriptions/schemas.ts
import { z } from 'zod';

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['streaming', 'software', 'gaming', 'music', 'cloud']),
  price: z.number().positive('Price must be positive'),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'quarterly']),
  startDate: z.string().datetime(),
  autoRenew: z.boolean().default(true),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
```

### Form Component

```svelte
<script lang="ts">
  import { subscriptionSchema, type SubscriptionFormData } from './schemas';

  let formData = $state<Partial<SubscriptionFormData>>({});
  let errors = $state<Record<string, string>>({});
  let submitting = $state(false);

  async function handleSubmit() {
    // Validate
    const result = subscriptionSchema.safeParse(formData);

    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
      return;
    }

    // Submit
    submitting = true;
    try {
      await subscriptionService.create(result.data);
      // Success handling
    } catch (e) {
      // Error handling
    } finally {
      submitting = false;
    }
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <Input
    label="Name"
    bind:value={formData.name}
    error={errors.name}
  />

  <Select
    label="Category"
    bind:value={formData.category}
    options={categoryOptions}
    error={errors.category}
  />

  <Button type="submit" loading={submitting}>
    Create Subscription
  </Button>
</form>
```

---

## Error Handling

### API Error Class

```typescript
// src/lib/services/core/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isValidationError() {
    return this.status === 422;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}
```

### Error Handling in Components

```svelte
<script lang="ts">
  import { toastStore } from '$stores/toast';
  import { ApiError } from '$services/core/api-error';

  async function handleDelete(id: string) {
    try {
      await subscriptionService.delete(id);
      toastStore.success('Subscription deleted');
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.isNotFound) {
          toastStore.error('Subscription not found');
        } else if (e.isForbidden) {
          toastStore.error('You do not have permission');
        } else {
          toastStore.error(e.message);
        }
      } else {
        toastStore.error('An unexpected error occurred');
      }
    }
  }
</script>
```

---

## WebSocket Integration

### WebSocket Service

```typescript
// src/lib/services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    const url = `${import.meta.env.VITE_WS_URL}?token=${token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };
  }

  private handleMessage(data: WebSocketMessage) {
    switch (data.type) {
      case 'notification':
        notificationStore.add(data.payload);
        break;
      case 'subscription_reminder':
        // Handle reminder
        break;
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

export const wsService = new WebSocketService();
```

---

## Related Documentation

- [Architecture](./01-architecture.md)
- [Development Guide](./02-development-guide.md)
- [Component Design](./04-component-design.md)
