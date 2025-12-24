# 後台管理系統 - 開發規範指南

> 版本：2.0.0
> 最後更新：2024年12月

---

## 目錄

1. [命名規範](#命名規範)
2. [TypeScript 規範](#typescript-規範)
3. [模組開發規範](#模組開發規範)
4. [Svelte 組件規範](#svelte-組件規範)
5. [樣式規範](#樣式規範)
6. [Git 工作流程](#git-工作流程)
7. [程式碼審查標準](#程式碼審查標準)
8. [測試規範](#測試規範)
9. [效能規範](#效能規範)
10. [無障礙規範](#無障礙規範)

---

## 命名規範

### 檔案命名

| 類型 | 規範 | 範例 |
|------|------|------|
| Svelte 組件 | PascalCase | `Button.svelte`, `DataTable.svelte` |
| TypeScript 檔案 | kebab-case | `api-client.ts`, `user.service.ts` |
| 樣式檔案 | kebab-case | `global-styles.css` |
| 測試檔案 | 原檔名 + .test | `Button.test.ts`, `api-client.test.ts` |
| 常數檔案 | kebab-case | `route-constants.ts` |

### 變數與函式命名

```typescript
// 變數：camelCase
const userName = 'John';
const isLoading = false;
const maxRetryCount = 3;

// 常數：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const DEFAULT_PAGE_SIZE = 20;

// 函式：camelCase，動詞開頭
function getUserById(id: string): Promise<User> { }
function validateEmail(email: string): boolean { }
function formatCurrency(amount: number): string { }

// 布林值：is/has/can/should 開頭
const isVisible = true;
const hasPermission = false;
const canEdit = true;
const shouldRefresh = false;

// 事件處理：handle 開頭
function handleClick(event: MouseEvent) { }
function handleSubmit(data: FormData) { }
function handleInputChange(value: string) { }
```

### 型別與介面命名

```typescript
// 介面：PascalCase，描述性名稱
interface User {
  id: string;
  name: string;
  email: string;
}

// 型別別名：PascalCase
type UserRole = 'admin' | 'editor' | 'viewer';
type AsyncState<T> = 'idle' | 'loading' | 'success' | 'error';

// API 響應型別：加 Response 後綴
interface UserListResponse {
  data: User[];
  pagination: Pagination;
}

// API 請求型別：加 Request 後綴
interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

// Props 型別：加 Props 後綴
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}
```

---

## TypeScript 規範

### 嚴格模式配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 型別定義最佳實踐

```typescript
// 明確定義函式返回型別
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// 使用泛型增加重用性
function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  return api.get<T>(url);
}

// 避免使用 any，改用 unknown
function parseJSON(text: string): unknown {
  return JSON.parse(text);
}

// 使用型別守衛
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}

// 使用 satisfies 確保型別符合
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} satisfies AppConfig;
```

### 禁止使用的模式

```typescript
// 禁止使用 any
const data: any = {}; // 錯誤

// 禁止使用 @ts-ignore
// @ts-ignore // 錯誤

// 禁止使用非空斷言（除非絕對必要）
const value = obj!.property; // 謹慎使用

// 避免使用 as 型別斷言
const user = data as User; // 謹慎使用，優先使用型別守衛
```

---

## 模組開發規範

專案採用 Feature Module 架構，所有功能模組位於 `src/lib/modules/` 目錄下。

### 模組目錄結構

每個模組應遵循以下標準結構：

```
src/lib/modules/{module-name}/
├── index.ts                    # 模組導出和配置
├── types.ts                    # 類型定義
├── services/                   # 業務邏輯服務層
│   └── {feature}.service.ts
└── components/                 # 模組專屬元件
    └── {Component}.svelte
```

### 建立新模組步驟

1. **建立目錄結構**
```bash
mkdir -p src/lib/modules/my-module/{services,components}
touch src/lib/modules/my-module/{index.ts,types.ts}
```

2. **定義類型** (`types.ts`)
```typescript
// 明確定義模組內使用的所有類型
export interface MyEntity {
  id: string;
  name: string;
  createdAt: Date;
}

export interface MyFilters {
  search?: string;
  status?: 'active' | 'inactive';
}
```

3. **建立服務層** (`services/my-feature.service.ts`)
```typescript
import type { MyEntity, MyFilters } from '../types';

class MyFeatureService {
  // 業務邏輯方法
  filterEntities(entities: MyEntity[], filters: MyFilters): MyEntity[] {
    // ...
  }

  formatEntity(entity: MyEntity): FormattedEntity {
    // ...
  }
}

export const myFeatureService = new MyFeatureService();
```

4. **建立元件** (`components/MyComponent.svelte`)
```svelte
<script lang="ts">
  import type { MyEntity } from '../types';
  import { myFeatureService } from '../services/my-feature.service';

  interface Props {
    entity: MyEntity;
    onAction: (id: string) => void;
  }

  let { entity, onAction }: Props = $props();
</script>
```

5. **設定模組導出** (`index.ts`)
```typescript
// Types
export type { MyEntity, MyFilters } from './types';

// Services
export { myFeatureService } from './services/my-feature.service';

// Components
export { default as MyComponent } from './components/MyComponent.svelte';

// Module config
import type { ModuleConfig } from '../types';
import { navIcons } from '../navigation';

export const myModuleConfig: ModuleConfig = {
  id: 'my-module',
  name: '我的模組',
  description: '模組描述',
  basePath: '/my-module',
  navigation: [
    {
      id: 'my-feature',
      label: '功能名稱',
      href: '/my-module',
      icon: navIcons.dashboard,
      order: 50
    }
  ],
  enabled: true
};
```

6. **註冊模組** (`src/lib/modules/index.ts`)
```typescript
import { myModuleConfig } from './my-module';

moduleRegistry.registerModule(myModuleConfig);
```

### 模組命名規範

| 項目 | 規範 | 範例 |
|------|------|------|
| 模組目錄 | kebab-case | `my-module/`, `user-management/` |
| 類型檔案 | types.ts | `types.ts` |
| 服務檔案 | {feature}.service.ts | `profile.service.ts` |
| 元件檔案 | PascalCase | `UserCard.svelte` |

### 服務層設計原則

```typescript
// 1. 使用 class 封裝相關功能
class ProfileService {
  // 2. 公開方法應該有明確的輸入輸出類型
  updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    // ...
  }

  // 3. 純函數優先：無副作用、可測試
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // 4. 格式化函數集中管理
  formatDisplayName(user: User): string {
    return user.displayName || user.email.split('@')[0];
  }
}

// 5. 導出單例
export const profileService = new ProfileService();
```

### 模組間依賴規則

```
✅ 允許
- 模組可以導入 $lib/components/ui (通用元件)
- 模組可以導入 $lib/services (API 服務)
- 模組可以導入 $lib/stores (全域狀態)
- 模組可以導入 $lib/types (共用類型)

❌ 禁止
- 模組不應直接導入其他模組的內部元件
- 模組間應透過公開的 index.ts 導出進行互動
```

---

## Svelte 組件規範

### 組件結構模板

```svelte
<!-- Button.svelte -->
<script lang="ts">
  // 1. 型別導入
  import type { Snippet } from 'svelte';

  // 2. 組件導入
  import { Spinner } from '$lib/components/ui';

  // 3. 工具函式導入
  import { cn } from '$lib/utils';

  // 4. Props 定義（使用 Svelte 5 語法）
  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
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
    class: className = '',
    children,
    onclick
  }: Props = $props();

  // 5. 內部狀態
  let isPressed = $state(false);

  // 6. 衍生狀態
  let isDisabled = $derived(disabled || loading);

  // 7. 樣式計算
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantStyles: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
  };

  const sizeStyles: Record<string, string> = {
    sm: 'h-8 px-3 text-sm rounded-md',
    md: 'h-10 px-4 text-sm rounded-md',
    lg: 'h-12 px-6 text-base rounded-lg'
  };

  let computedClass = $derived(
    cn(baseStyles, variantStyles[variant], sizeStyles[size], className)
  );

  // 8. 事件處理函式
  function handleClick(event: MouseEvent) {
    if (!isDisabled && onclick) {
      onclick(event);
    }
  }
</script>

<!-- 9. 模板 -->
<button
  {type}
  class={computedClass}
  disabled={isDisabled}
  aria-disabled={isDisabled}
  onclick={handleClick}
>
  {#if loading}
    <Spinner class="mr-2 h-4 w-4" />
  {/if}
  {@render children()}
</button>
```

### 組件檔案組織

```
components/
├── ui/
│   ├── Button.svelte       # 組件檔案
│   ├── Button.test.ts      # 測試檔案（同目錄）
│   └── index.ts            # 統一匯出
```

### 匯出檔案範例

```typescript
// src/lib/components/ui/index.ts
export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Card } from './Card.svelte';
export { default as Table } from './Table.svelte';
export { default as Badge } from './Badge.svelte';
```

---

## 樣式規範

### Tailwind CSS 組織

```typescript
// 使用 cn 工具函式合併樣式
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 使用範例
const buttonClass = cn(
  'px-4 py-2 rounded-md',                    // 基礎樣式
  variant === 'primary' && 'bg-blue-600',    // 條件樣式
  disabled && 'opacity-50 cursor-not-allowed', // 狀態樣式
  className                                    // 自定義樣式
);
```

### 樣式優先順序

```svelte
<script>
  // 1. 基礎樣式（必須的結構樣式）
  // 2. 變體樣式（根據 props 變化）
  // 3. 尺寸樣式（響應式調整）
  // 4. 狀態樣式（hover、focus、disabled）
  // 5. 自定義樣式（外部傳入的 class）
</script>

<div class="
  flex items-center gap-2
  bg-white border border-gray-200
  p-4 rounded-lg
  hover:shadow-md
  transition-shadow duration-200
  {className}
">
```

### 響應式設計原則

```svelte
<!-- 行動優先設計 -->
<div class="
  grid
  grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
```

### 深色模式支援

```svelte
<div class="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
```

---

## Git 工作流程

### 分支命名規範

| 類型 | 格式 | 範例 |
|------|------|------|
| 功能 | `feature/功能描述` | `feature/user-authentication` |
| 修復 | `fix/問題描述` | `fix/login-redirect-issue` |
| 熱修 | `hotfix/問題描述` | `hotfix/critical-security-patch` |
| 重構 | `refactor/描述` | `refactor/api-client-structure` |
| 文檔 | `docs/描述` | `docs/api-documentation` |

### Commit 訊息規範

採用 Conventional Commits 規範：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 類型定義

| 類型 | 說明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 錯誤修復 |
| `docs` | 文檔更新 |
| `style` | 程式碼格式（不影響功能） |
| `refactor` | 重構（非新功能或修復） |
| `perf` | 效能優化 |
| `test` | 測試相關 |
| `chore` | 建置或輔助工具變動 |

#### 範例

```bash
# 新功能
feat(auth): add JWT token refresh mechanism

# 錯誤修復
fix(users): resolve pagination offset calculation

# 重構
refactor(api): migrate to new fetch wrapper

# 含詳細說明
feat(dashboard): implement real-time statistics

- Add WebSocket connection for live updates
- Create StatCard component for data display
- Implement automatic reconnection logic

Closes #123
```

### Pull Request 檢查清單

```markdown
## 變更說明
<!-- 簡述此 PR 的目的與變更內容 -->

## 變更類型
- [ ] 新功能
- [ ] 錯誤修復
- [ ] 重構
- [ ] 文檔更新
- [ ] 效能優化

## 檢查清單
- [ ] 程式碼符合專案規範
- [ ] 已新增必要的測試
- [ ] 所有測試通過
- [ ] 已更新相關文檔
- [ ] 已處理所有 TypeScript 錯誤
- [ ] 已進行自我程式碼審查

## 截圖（如適用）
<!-- 附上 UI 變更的截圖 -->

## 備註
<!-- 其他需要說明的事項 -->
```

---

## 程式碼審查標準

### 審查重點

#### 1. 功能正確性

- 是否符合需求規格？
- 邊界條件處理是否完整？
- 錯誤處理是否適當？

#### 2. 程式碼品質

- 命名是否清晰易懂？
- 邏輯是否過於複雜？
- 是否有重複程式碼？

#### 3. 效能考量

- 是否有不必要的重新渲染？
- 是否有 N+1 查詢問題？
- 資源是否正確釋放？

#### 4. 安全性

- 是否有 XSS 風險？
- 敏感資料處理是否安全？
- 權限檢查是否完整？

#### 5. 可維護性

- 是否容易理解和修改？
- 是否有足夠的型別定義？
- 是否需要補充註解？

### 審查回饋範例

```markdown
# 建議（非阻塞）
💡 建議：可以考慮使用 `useMemo` 優化這個計算

# 問題（需要修正）
🔴 問題：這裡缺少錯誤處理，當 API 失敗時會導致應用崩潰

# 疑問（需要說明）
❓ 疑問：這個邏輯的目的是什麼？可以補充註解說明嗎？

# 讚賞
👍 很棒的抽象設計，大幅提升了可重用性！
```

---

## 測試規範

### 測試檔案結構

```
tests/
├── unit/                      # 單元測試
│   ├── components/           # 組件測試
│   │   └── Button.test.ts
│   ├── utils/                # 工具函式測試
│   │   └── format.test.ts
│   └── stores/               # Store 測試
│       └── auth.test.ts
│
└── e2e/                       # E2E 測試
    ├── auth.spec.ts          # 認證流程
    └── users.spec.ts         # 使用者管理流程
```

### 單元測試範例

```typescript
// tests/unit/components/Button.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button', () => {
  it('renders with default props', () => {
    const { getByRole } = render(Button, {
      props: { children: () => 'Click me' }
    });

    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('calls onclick handler when clicked', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, {
      props: {
        children: () => 'Click me',
        onclick: handleClick
      }
    });

    await fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onclick when disabled', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, {
      props: {
        children: () => 'Click me',
        onclick: handleClick,
        disabled: true
      }
    });

    await fireEvent.click(getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    const { getByRole, container } = render(Button, {
      props: {
        children: () => 'Submit',
        loading: true
      }
    });

    expect(container.querySelector('.spinner')).toBeInTheDocument();
    expect(getByRole('button')).toBeDisabled();
  });
});
```

### E2E 測試範例

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('儀表板');
  });

  test('invalid credentials shows error message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('帳號或密碼錯誤');
  });
});
```

### 測試覆蓋率要求

| 類型 | 最低覆蓋率 |
|------|-----------|
| 語句覆蓋 | 80% |
| 分支覆蓋 | 75% |
| 函式覆蓋 | 80% |
| 行覆蓋 | 80% |

---

## 效能規範

### 組件效能優化

```svelte
<script lang="ts">
  // 1. 使用 $derived 避免不必要的計算
  let expensiveResult = $derived.by(() => {
    // 只在依賴變更時重新計算
    return items.filter(item => item.active).map(item => item.value);
  });

  // 2. 條件渲染避免不必要的 DOM 操作
  let shouldShowDetails = $state(false);
</script>

<!-- 3. 使用 key 確保正確的列表渲染 -->
{#each items as item (item.id)}
  <ListItem {item} />
{/each}

<!-- 4. 懶加載非關鍵內容 -->
{#if shouldShowDetails}
  <Details />
{/if}
```

### Bundle 大小限制

| 資源類型 | 大小限制 |
|---------|---------|
| 首頁 JS | < 100KB (gzip) |
| 首頁 CSS | < 30KB (gzip) |
| 單頁 JS | < 50KB (gzip) |
| 圖片 | < 200KB |

---

## 無障礙規範

### WCAG 2.1 AA 標準

```svelte
<!-- 1. 語義化 HTML -->
<nav aria-label="主要導覽">
  <ul>
    <li><a href="/dashboard">儀表板</a></li>
  </ul>
</nav>

<!-- 2. 表單標籤 -->
<label for="email">電子郵件</label>
<input id="email" type="email" aria-describedby="email-hint" />
<span id="email-hint">請輸入有效的電子郵件地址</span>

<!-- 3. 鍵盤操作支援 -->
<button
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  確認
</button>

<!-- 4. 焦點管理 -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">確認刪除</h2>
</div>

<!-- 5. 色彩對比 -->
<!-- 確保文字與背景對比度 >= 4.5:1 -->
<span class="text-gray-700 bg-white">可讀文字</span>
```

### 檢測工具

- axe DevTools 瀏覽器擴充
- Lighthouse 無障礙審計
- 鍵盤導覽測試

---

## 附錄

### 相關文檔

- [01-專案架構文檔](./01-專案架構文檔.md)
- [03-API整合規範](./03-API整合規範.md)
- [04-元件設計文檔](./04-元件設計文檔.md)
- [05-部署與建置指南](./05-部署與建置指南.md)

### ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
    extraFileExtensions: ['.svelte']
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

### Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```
