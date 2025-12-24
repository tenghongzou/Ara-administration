# 後台管理系統 - API 整合規範

> 版本：1.0.0
> 最後更新：2024年12月

---

## 目錄

1. [API 客戶端設計](#api-客戶端設計)
2. [認證機制](#認證機制)
3. [服務層設計](#服務層設計)
4. [型別定義](#型別定義)
5. [SvelteKit 資料載入](#sveltekit-資料載入)
6. [表單處理](#表單處理)
7. [資料驗證](#資料驗證)
8. [錯誤處理](#錯誤處理)
9. [快取策略](#快取策略)
10. [進階整合](#進階整合)

---

## API 客戶端設計

### 基礎 API 客戶端

```typescript
// src/lib/services/api-client.ts
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { auth } from '$lib/stores/auth';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    this.defaultTimeout = 30000;
  }

  private getToken(): string | null {
    if (!browser) return null;
    return localStorage.getItem('access_token');
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, skipAuth = false, ...fetchConfig } = config;

    const headers = new Headers(fetchConfig.headers);

    // 設定 Content-Type
    if (!headers.has('Content-Type') && !(fetchConfig.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // 設定認證標頭
    if (!skipAuth && browser) {
      const token = this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // 建立 AbortController 處理超時
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchConfig,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 處理 401 未授權
      if (response.status === 401 && !skipAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // 重試原請求
          return this.request<T>(endpoint, config);
        } else {
          // 清除認證狀態並重導向
          auth.logout();
          if (browser) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            await goto('/login');
          }
          throw new ApiError(401, 'Unauthorized');
        }
      }

      // 處理錯誤響應
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, errorData);
      }

      // 處理 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'Request Timeout');
      }

      throw new ApiError(0, 'Network Error', error);
    }
  }

  // HTTP 方法封裝
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const api = new ApiClient();
```

---

## 認證機制

### 認證服務

```typescript
// src/lib/services/auth.service.ts
import { api, type ApiResponse } from './api-client';
import { auth } from '$lib/stores/auth';
import type { User, LoginCredentials, RegisterData } from '$lib/types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials,
      { skipAuth: true }
    );

    const { user, tokens } = response.data;

    // 儲存 Token
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);

    // 更新全域狀態
    auth.setUser(user, tokens.accessToken);

    return user;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/register',
      data,
      { skipAuth: true }
    );

    const { user, tokens } = response.data;

    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    auth.setUser(user, tokens.accessToken);

    return user;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      auth.logout();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email }, { skipAuth: true });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password }, { skipAuth: true });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  }
}

export const authService = new AuthService();
```

---

## 服務層設計

### 使用者服務範例

```typescript
// src/lib/services/user.service.ts
import { api, type ApiResponse, type PaginatedResponse } from './api-client';
import type { User, CreateUserData, UpdateUserData, UserFilters } from '$lib/types';

class UserService {
  private readonly basePath = '/users';

  async getUsers(
    page = 1,
    pageSize = 20,
    filters?: UserFilters
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    if (filters?.search) {
      params.set('search', filters.search);
    }
    if (filters?.role) {
      params.set('role', filters.role);
    }
    if (filters?.status) {
      params.set('status', filters.status);
    }

    return api.get<PaginatedResponse<User>>(`${this.basePath}?${params}`);
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`${this.basePath}/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post<ApiResponse<User>>(this.basePath, data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async toggleUserStatus(id: string, active: boolean): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(
      `${this.basePath}/${id}/status`,
      { active }
    );
    return response.data;
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    const response = await api.post<ApiResponse<User>>(
      `${this.basePath}/${userId}/roles/${roleId}`
    );
    return response.data;
  }
}

export const userService = new UserService();
```

### 服務匯出

```typescript
// src/lib/services/index.ts
export { api, ApiError, type ApiResponse, type PaginatedResponse } from './api-client';
export { authService } from './auth.service';
export { userService } from './user.service';
```

---

## 型別定義

### API 相關型別

```typescript
// src/lib/types/api.ts

// 通用響應型別
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationErrors;
}

export interface ValidationErrors {
  [field: string]: string[];
}

// 分頁相關
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

// 排序相關
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// 篩選相關
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in';
  value: unknown;
}
```

### 業務模型型別

```typescript
// src/lib/types/models.ts

// 使用者相關
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  avatar?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

// 認證相關
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

// 審計日誌
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
```

---

## SvelteKit 資料載入

### 頁面資料載入

```typescript
// src/routes/(app)/users/+page.ts
import type { PageLoad } from './$types';
import { userService } from '$lib/services';
import type { UserFilters } from '$lib/types';

export const load: PageLoad = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
  const search = url.searchParams.get('search') || undefined;
  const role = url.searchParams.get('role') as UserFilters['role'] || undefined;

  const filters: UserFilters = { search, role };

  try {
    const result = await userService.getUsers(page, pageSize, filters);
    return {
      users: result.data,
      pagination: result.pagination,
      filters
    };
  } catch (error) {
    return {
      users: [],
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      filters,
      error: '無法載入使用者列表'
    };
  }
};
```

### 伺服器端資料載入

```typescript
// src/routes/(app)/users/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/users/${params.id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw error(404, '找不到該使用者');
    }
    throw error(500, '載入使用者資料失敗');
  }

  const data = await response.json();

  return {
    user: data.data
  };
};
```

### Layout 資料載入

```typescript
// src/routes/(app)/+layout.ts
import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { authService } from '$lib/services';
import { auth } from '$lib/stores/auth';

export const load: LayoutLoad = async () => {
  if (browser) {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw redirect(302, '/login');
    }

    try {
      const user = await authService.getCurrentUser();
      if (user) {
        auth.setUser(user, token);
        return { user };
      } else {
        throw redirect(302, '/login');
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw redirect(302, '/login');
    }
  }

  return { user: null };
};
```

---

## 表單處理

### Form Actions

```typescript
// src/routes/(app)/users/create/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
  name: z.string().min(2, '名稱至少需要 2 個字元'),
  password: z.string().min(8, '密碼至少需要 8 個字元'),
  role: z.enum(['admin', 'manager', 'editor', 'viewer'])
});

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // 驗證輸入
    const result = createUserSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        values: data
      });
    }

    // 呼叫 API
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(response.status, {
        error: error.message || '建立使用者失敗',
        values: data
      });
    }

    throw redirect(303, '/users');
  }
};
```

### 表單組件

```svelte
<!-- src/routes/(app)/users/create/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button, Input, Select } from '$lib/components/ui';

  let { form } = $props();

  let isSubmitting = $state(false);

  const roles = [
    { value: 'admin', label: '管理員' },
    { value: 'manager', label: '經理' },
    { value: 'editor', label: '編輯者' },
    { value: 'viewer', label: '檢視者' }
  ];
</script>

<form
  method="POST"
  use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      await update();
      isSubmitting = false;
    };
  }}
>
  <Input
    name="email"
    type="email"
    label="電子郵件"
    value={form?.values?.email ?? ''}
    error={form?.errors?.email?.[0]}
    required
  />

  <Input
    name="name"
    label="名稱"
    value={form?.values?.name ?? ''}
    error={form?.errors?.name?.[0]}
    required
  />

  <Input
    name="password"
    type="password"
    label="密碼"
    error={form?.errors?.password?.[0]}
    required
  />

  <Select
    name="role"
    label="角色"
    options={roles}
    value={form?.values?.role ?? 'viewer'}
    error={form?.errors?.role?.[0]}
  />

  {#if form?.error}
    <p class="text-red-600 text-sm">{form.error}</p>
  {/if}

  <div class="flex gap-4 mt-6">
    <Button type="submit" loading={isSubmitting}>
      建立使用者
    </Button>
    <Button variant="outline" href="/users">
      取消
    </Button>
  </div>
</form>
```

---

## 資料驗證

### Zod Schema 定義

```typescript
// src/lib/validation/user.schema.ts
import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, '電子郵件為必填')
  .email('請輸入有效的電子郵件格式');

export const passwordSchema = z
  .string()
  .min(8, '密碼至少需要 8 個字元')
  .regex(/[A-Z]/, '密碼需包含至少一個大寫字母')
  .regex(/[a-z]/, '密碼需包含至少一個小寫字母')
  .regex(/[0-9]/, '密碼需包含至少一個數字');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '密碼為必填')
});

export const registerSchema = z
  .object({
    email: emailSchema,
    name: z.string().min(2, '名稱至少需要 2 個字元').max(50, '名稱最多 50 個字元'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, '請確認密碼')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密碼不一致',
    path: ['confirmPassword']
  });

export const updateUserSchema = z.object({
  name: z.string().min(2, '名稱至少需要 2 個字元').max(50).optional(),
  email: emailSchema.optional(),
  role: z.enum(['admin', 'manager', 'editor', 'viewer']).optional()
});

// 型別推導
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

### 驗證工具函式

```typescript
// src/lib/utils/validation.ts
import type { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}

// 使用範例
// const result = validate(loginSchema, formData);
// if (!result.success) {
//   // 處理驗證錯誤
//   console.log(result.errors);
// }
```

---

## 錯誤處理

### 全域錯誤處理

```typescript
// src/lib/utils/error-handler.ts
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { toast } from '$lib/stores/toast';
import { ApiError } from '$lib/services';

interface ErrorMessages {
  [key: number]: string;
}

const defaultMessages: ErrorMessages = {
  400: '請求格式錯誤',
  401: '請重新登入',
  403: '您沒有權限執行此操作',
  404: '找不到請求的資源',
  408: '請求逾時，請稍後再試',
  422: '資料驗證失敗',
  429: '請求過於頻繁，請稍後再試',
  500: '伺服器發生錯誤',
  502: '伺服器暫時無法使用',
  503: '服務暫時不可用'
};

export function handleApiError(error: unknown): void {
  if (!browser) return;

  if (error instanceof ApiError) {
    const message = defaultMessages[error.status] || '發生未知錯誤';

    // 顯示錯誤通知
    toast.error(message);

    // 特殊處理
    if (error.status === 401) {
      goto('/login');
    }

    // 記錄錯誤（可整合錯誤追蹤服務）
    console.error('API Error:', {
      status: error.status,
      statusText: error.statusText,
      data: error.data
    });
  } else if (error instanceof Error) {
    toast.error(error.message || '發生未知錯誤');
    console.error('Error:', error);
  } else {
    toast.error('發生未知錯誤');
    console.error('Unknown error:', error);
  }
}

// 非同步操作包裝器
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
  options?: {
    showToast?: boolean;
    rethrow?: boolean;
    fallback?: T;
  }
): Promise<T | undefined> {
  const { showToast = true, rethrow = false, fallback } = options || {};

  try {
    return await operation();
  } catch (error) {
    if (showToast) {
      handleApiError(error);
    }
    if (rethrow) {
      throw error;
    }
    return fallback;
  }
}
```

### 錯誤邊界組件

```svelte
<!-- src/lib/components/ErrorBoundary.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    fallback?: import('svelte').Snippet<[Error]>;
    children: import('svelte').Snippet;
  }

  let { fallback, children }: Props = $props();

  let error = $state<Error | null>(null);

  onMount(() => {
    const handleError = (event: ErrorEvent) => {
      error = event.error;
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  });

  function reset() {
    error = null;
  }
</script>

{#if error}
  {#if fallback}
    {@render fallback(error)}
  {:else}
    <div class="p-6 text-center">
      <h2 class="text-xl font-semibold text-red-600 mb-2">發生錯誤</h2>
      <p class="text-gray-600 mb-4">{error.message}</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onclick={reset}
      >
        重試
      </button>
    </div>
  {/if}
{:else}
  {@render children()}
{/if}
```

---

## 快取策略

### 快取服務

```typescript
// src/lib/services/cache.service.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 分鐘

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // 帶快取的請求
  async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = this.defaultTTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

export const cacheService = new CacheService();
```

### 使用快取的服務

```typescript
// 在服務中使用快取
import { cacheService } from './cache.service';

class UserService {
  async getUserById(id: string): Promise<User> {
    return cacheService.withCache(
      `user:${id}`,
      async () => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
      },
      10 * 60 * 1000 // 10 分鐘快取
    );
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);

    // 更新後清除快取
    cacheService.delete(`user:${id}`);
    cacheService.deleteByPrefix('users:list');

    return response.data;
  }
}
```

---

## 進階整合

### 請求重試機制

```typescript
// src/lib/utils/retry.ts
interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  shouldRetry?: (error: unknown) => boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 'exponential',
    shouldRetry = (error) => {
      if (error instanceof ApiError) {
        // 只重試可重試的錯誤碼
        return [408, 429, 500, 502, 503, 504].includes(error.status);
      }
      return false;
    }
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const waitTime = backoff === 'exponential'
        ? delay * Math.pow(2, attempt)
        : delay * (attempt + 1);

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}
```

### WebSocket 整合

```typescript
// src/lib/services/websocket.service.ts
type MessageHandler = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string): void {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handlers = this.handlers.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.data));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(url);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect(url);
    }, delay);
  }

  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  send(type: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
  }
}

export const wsService = new WebSocketService();
```

---

## 附錄

### 相關文檔

- [01-專案架構文檔](./01-專案架構文檔.md)
- [02-開發規範指南](./02-開發規範指南.md)
- [04-元件設計文檔](./04-元件設計文檔.md)
- [05-部署與建置指南](./05-部署與建置指南.md)

### API 端點參考

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/auth/login` | 使用者登入 |
| POST | `/auth/register` | 使用者註冊 |
| POST | `/auth/logout` | 使用者登出 |
| POST | `/auth/refresh` | 刷新 Token |
| GET | `/auth/me` | 取得當前使用者 |
| GET | `/users` | 使用者列表 |
| GET | `/users/:id` | 使用者詳情 |
| POST | `/users` | 建立使用者 |
| PATCH | `/users/:id` | 更新使用者 |
| DELETE | `/users/:id` | 刪除使用者 |
