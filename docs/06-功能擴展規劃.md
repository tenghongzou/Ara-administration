# 後台管理系統 - 功能擴展規劃

> 版本：1.0.0
> 最後更新：2024年12月

---

## 目錄

1. [基礎設施評估](#基礎設施評估)
2. [快速實作功能](#快速實作功能)
3. [中等複雜度功能](#中等複雜度功能)
4. [高複雜度功能](#高複雜度功能)
5. [新模組建議](#新模組建議)
6. [實作優先順序](#實作優先順序)
7. [開發指南](#開發指南)

---

## 基礎設施評估

當前專案已具備完善的基礎設施，可快速支援新功能開發：

| 基礎設施 | 狀態 | 支援程度 | 說明 |
|----------|------|----------|------|
| 模組系統 | ✅ 完善 | 高 | Feature Module 架構，新模組可快速建立 |
| WebSocket | ✅ 已實作 | 高 | 即時推送就緒，心跳檢測、自動重連已實作 |
| 權限系統 | ✅ 完善 | 高 | RBAC 架構，權限群組可擴展 |
| API 服務層 | ✅ 標準化 | 高 | RESTful API 封裝，新 API 可快速整合 |
| 表單驗證 | ✅ Zod | 高 | Schema 驗證，複雜表單可擴展 |
| 圖表庫 | ✅ Chart.js | 高 | 視覺化就緒，支援多種圖表類型 |
| 匯出功能 | ✅ CSV/Excel | 中 | 可擴展 PDF、JSON 等格式 |
| 狀態管理 | ✅ Svelte 5 Runes | 高 | 響應式狀態管理完善 |
| 深色模式 | ✅ Tailwind | 高 | CSS 變數系統支援主題切換 |

### 現有模組清單

```
src/lib/modules/
├── navigation/      # 導航配置
├── dashboard/       # 儀表板 (9 files)
├── subscriptions/   # 訂閱管理 (31 files)
├── notifications/   # 通知系統 (11 files)
├── logs/           # 日誌管理 (10 files)
├── account/        # 帳號設定 (26 files)
├── users/          # 使用者管理 (14 files)
├── roles/          # 角色權限 (10 files)
└── settings/       # 系統設定 (20 files)
```

---

## 快速實作功能

預估開發時間：1-2 天

### 1. 即時通知推送

**概述**

利用現有 WebSocket 基礎設施，實現即時通知推送功能。

| 項目 | 說明 |
|------|------|
| 現有支援 | WebSocket 完整實作，`handleNotification` 已定義 |
| 需要新增 | 連接到 `(app)/+layout.svelte`、Toast 整合 |
| 複雜度 | ⭐ 低 |
| 檔案數 | ~2 個修改 |

**實作方式**

```typescript
// src/routes/(app)/+layout.svelte
import { browser } from '$app/environment';
import { initWebSocket, closeWebSocket } from '$lib/services/websocket';
import { auth } from '$lib/stores/auth';

$effect(() => {
  if (browser && $auth.token) {
    initWebSocket();
  }
  return () => closeWebSocket();
});
```

**WebSocket 訊息處理 (已實作)**

```typescript
// src/lib/services/websocket.ts
function handleNotification(payload: NotificationPayload) {
  notifications.add({
    type: payload.type,
    title: payload.title,
    message: payload.message,
    link: payload.link
  });
}
```

---

### 2. 訂閱到期提醒排程

**概述**

基於現有 `reminderDays` 欄位，實現訂閱到期前的自動提醒功能。

| 項目 | 說明 |
|------|------|
| 現有支援 | `Subscription.reminderDays` 欄位、通知設定已有 |
| 需要新增 | 提醒設定 UI、後端排程服務 |
| 複雜度 | ⭐ 低 (前端) |
| 檔案數 | ~3 個 |

**新增類型**

```typescript
// src/lib/modules/subscriptions/types.ts
export interface ReminderSettings {
  enabled: boolean;
  daysBefore: number[];  // [1, 3, 7] = 1天、3天、7天前提醒
  channels: ('email' | 'push' | 'inApp')[];
}
```

**UI 整合位置**

- `SubscriptionForm.svelte` - 新增提醒設定區塊
- `NotificationSettingsContent.svelte` - 新增訂閱提醒開關

---

### 3. 深色模式持久化

**概述**

將使用者的主題偏好儲存至 localStorage，實現跨 Session 持久化。

| 項目 | 說明 |
|------|------|
| 現有支援 | `ThemeSection` 組件、`ui` store |
| 需要新增 | localStorage 同步邏輯 |
| 複雜度 | ⭐ 低 |
| 檔案數 | ~1 個修改 |

**實作方式**

```typescript
// src/lib/stores/ui.ts
import { browser } from '$app/environment';

function createUIStore() {
  const stored = browser ? localStorage.getItem('theme') : null;
  const initialTheme = (stored as UIState['theme']) || 'system';

  const { subscribe, update } = writable<UIState>({
    sidebarOpen: true,
    theme: initialTheme,
    locale: 'zh-TW'
  });

  return {
    subscribe,
    setTheme: (theme: UIState['theme']) => {
      update(state => ({ ...state, theme }));
      if (browser) {
        localStorage.setItem('theme', theme);
        applyTheme(theme);
      }
    }
  };
}

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}
```

---

### 4. 鍵盤快捷鍵

**概述**

為常用操作添加鍵盤快捷鍵，提升進階使用者的操作效率。

| 項目 | 說明 |
|------|------|
| 現有支援 | Svelte action 機制 |
| 需要新增 | `use:shortcuts` action、快捷鍵設定 UI |
| 複雜度 | ⭐ 低 |
| 檔案數 | ~3 個 |

**快捷鍵定義**

| 快捷鍵 | 功能 |
|--------|------|
| `Ctrl/Cmd + K` | 開啟全域搜尋 |
| `Ctrl/Cmd + N` | 新增項目 |
| `Ctrl/Cmd + S` | 儲存表單 |
| `Escape` | 關閉 Modal/返回 |
| `?` | 顯示快捷鍵說明 |

**實作方式**

```typescript
// src/lib/actions/shortcuts.ts
export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
}

export function shortcuts(node: HTMLElement, config: ShortcutConfig[]) {
  function handleKeydown(event: KeyboardEvent) {
    for (const shortcut of config) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }

  window.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      window.removeEventListener('keydown', handleKeydown);
    }
  };
}
```

---

## 中等複雜度功能

預估開發時間：3-5 天

### 5. 全域搜尋功能

**概述**

實現跨模組的統一搜尋功能，支援使用者、訂閱、通知等多種資源搜尋。

| 項目 | 說明 |
|------|------|
| 現有支援 | 各模組已有 search 篩選邏輯 |
| 需要新增 | 統一搜尋 API、CommandPalette 組件 |
| 複雜度 | ⭐⭐ 中 |
| 檔案數 | ~8 個 |

**目錄結構**

```
src/lib/modules/search/
├── index.ts
├── types.ts
├── services/
│   └── search.service.ts
└── components/
    ├── CommandPalette.svelte
    ├── SearchResults.svelte
    └── SearchResultItem.svelte
```

**類型定義**

```typescript
// src/lib/modules/search/types.ts
export type SearchResultType = 'user' | 'subscription' | 'notification' | 'setting' | 'action';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  icon?: string;
  href?: string;
  action?: () => void;
  keywords: string[];
}

export interface SearchFilters {
  types?: SearchResultType[];
  limit?: number;
}
```

**服務層**

```typescript
// src/lib/modules/search/services/search.service.ts
class SearchService {
  private providers: Map<SearchResultType, SearchProvider> = new Map();

  register(type: SearchResultType, provider: SearchProvider) {
    this.providers.set(type, provider);
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const types = filters?.types || Array.from(this.providers.keys());

    await Promise.all(
      types.map(async (type) => {
        const provider = this.providers.get(type);
        if (provider) {
          const typeResults = await provider.search(query);
          results.push(...typeResults);
        }
      })
    );

    return results
      .sort((a, b) => this.calculateRelevance(b, query) - this.calculateRelevance(a, query))
      .slice(0, filters?.limit || 10);
  }
}
```

---

### 6. 活動時間軸

**概述**

提供使用者活動的時間軸視圖，增強系統可追溯性。

| 項目 | 說明 |
|------|------|
| 現有支援 | `AuditLog` 模型已定義、Logs 模組已有 |
| 需要新增 | 時間軸 UI 組件、使用者活動聚合 |
| 複雜度 | ⭐⭐ 中 |
| 檔案數 | ~6 個 |

**目錄結構**

```
src/lib/modules/activity/
├── index.ts
├── types.ts
├── services/
│   └── activity.service.ts
└── components/
    ├── ActivityTimeline.svelte
    ├── ActivityTimelineItem.svelte
    └── ActivityFilters.svelte
```

**類型定義**

```typescript
// src/lib/modules/activity/types.ts
export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: ActivityAction;
  resource: string;
  resourceId: string;
  resourceName: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'viewed'
  | 'exported'
  | 'logged_in'
  | 'logged_out';

export interface ActivityGroup {
  date: string;
  items: ActivityItem[];
}
```

---

### 7. 預算追蹤與警示

**概述**

為訂閱管理添加預算追蹤功能，當支出接近或超過預算時發出警示。

| 項目 | 說明 |
|------|------|
| 現有支援 | `Subscription.cost`、`SubscriptionStats` |
| 需要新增 | Budget 模型、警示通知、預算設定 UI |
| 複雜度 | ⭐⭐ 中 |
| 檔案數 | ~10 個 |

**目錄結構**

```
src/lib/modules/budget/
├── index.ts
├── types.ts
├── services/
│   └── budget.service.ts
└── components/
    ├── BudgetOverview.svelte
    ├── BudgetCard.svelte
    ├── BudgetForm.svelte
    ├── BudgetAlertSettings.svelte
    └── BudgetProgressBar.svelte
```

**類型定義**

```typescript
// src/lib/modules/budget/types.ts
export interface Budget {
  id: string;
  name: string;
  category?: ServiceCategory;  // null = 全部分類
  monthlyLimit: number;
  currency: string;
  alertThreshold: number;      // 0.8 = 80% 時警示
  alertEnabled: boolean;
  currentSpending: number;     // 計算值
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'warning' | 'exceeded';
  percentage: number;
  message: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpending: number;
  remainingBudget: number;
  utilizationRate: number;
  budgetsAtRisk: number;
  budgetsExceeded: number;
}
```

**服務層功能**

```typescript
// src/lib/modules/budget/services/budget.service.ts
class BudgetService {
  calculateSpending(subscriptions: Subscription[], category?: ServiceCategory): number;
  checkBudgetStatus(budget: Budget): 'safe' | 'warning' | 'exceeded';
  generateAlerts(budgets: Budget[]): BudgetAlert[];
  getBudgetSummary(budgets: Budget[]): BudgetSummary;
  formatBudgetProgress(budget: Budget): string;
}
```

---

### 8. 批量操作增強

**概述**

擴展現有批量操作功能，支援批量編輯、狀態變更和匯出。

| 項目 | 說明 |
|------|------|
| 現有支援 | Users/Subscriptions 已有批量刪除 |
| 需要新增 | 批量編輯 Modal、狀態變更、選擇性匯出 |
| 複雜度 | ⭐⭐ 中 |
| 檔案數 | ~5 個修改 |

**新增組件**

```
src/lib/components/ui/
└── BatchOperations.svelte    # 通用批量操作組件

src/lib/modules/users/components/
└── UsersBatchEditModal.svelte

src/lib/modules/subscriptions/components/
└── SubscriptionsBatchEditModal.svelte
```

**批量操作介面**

```typescript
// src/lib/components/ui/BatchOperations.svelte
interface Props {
  selectedCount: number;
  operations: BatchOperation[];
  onOperation: (type: string) => void;
  onClearSelection: () => void;
}

interface BatchOperation {
  type: string;
  label: string;
  icon?: Component;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}
```

---

### 9. 自訂儀表板 Widget

**概述**

允許使用者自訂儀表板佈局，選擇和排列 Widget。

| 項目 | 說明 |
|------|------|
| 現有支援 | Dashboard 已組件化 (StatsGrid, ActivityFeed) |
| 需要新增 | Widget 配置儲存、拖拽排序 |
| 複雜度 | ⭐⭐ 中 |
| 依賴 | 拖拽套件 (如 `@dnd-kit/core`) |

**Widget 類型定義**

```typescript
// src/lib/modules/dashboard/types.ts
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  config?: Record<string, unknown>;
  visible: boolean;
}

export type WidgetType =
  | 'stats-grid'
  | 'activity-feed'
  | 'quick-actions'
  | 'subscription-reminders'
  | 'budget-overview'
  | 'spending-chart'
  | 'calendar-preview';

export interface DashboardLayout {
  userId: string;
  widgets: DashboardWidget[];
  updatedAt: string;
}
```

---

## 高複雜度功能

預估開發時間：1-2 週

### 10. 報表產生器

**概述**

提供可自訂的報表產生功能，支援排程產生和多格式匯出。

| 項目 | 說明 |
|------|------|
| 現有支援 | Chart.js 已整合、CSV/Excel 匯出就緒 |
| 需要新增 | 報表模板、排程系統、PDF 匯出 |
| 複雜度 | ⭐⭐⭐ 高 |
| 檔案數 | ~15 個 |
| 依賴 | PDF 產生套件 (如 `jspdf`, `pdfmake`) |

**目錄結構**

```
src/lib/modules/reports/
├── index.ts
├── types.ts
├── services/
│   ├── reports.service.ts
│   ├── report-builder.ts
│   └── pdf-generator.ts
└── components/
    ├── ReportsContent.svelte
    ├── ReportBuilder.svelte
    ├── ReportPreview.svelte
    ├── ReportScheduler.svelte
    ├── ReportTemplateSelector.svelte
    ├── ReportFilters.svelte
    └── ReportExportOptions.svelte
```

**類型定義**

```typescript
// src/lib/modules/reports/types.ts
export interface Report {
  id: string;
  name: string;
  description?: string;
  template: ReportTemplate;
  filters: ReportFilters;
  schedule?: ReportSchedule;
  lastGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  sections: ReportSection[];
}

export interface ReportSection {
  type: 'summary' | 'table' | 'chart' | 'text';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export type ReportFilters = {
  dateRange: { start: string; end: string };
  categories?: ServiceCategory[];
  users?: string[];
};
```

---

### 11. 多租戶支援

**概述**

實現多租戶架構，支援組織隔離和跨租戶管理。

| 項目 | 說明 |
|------|------|
| 現有支援 | 權限系統完善 |
| 需要新增 | Tenant 模型、資料隔離、租戶切換 UI |
| 複雜度 | ⭐⭐⭐ 高 |
| 影響範圍 | 全部 API、所有模組 |

**目錄結構**

```
src/lib/modules/tenants/
├── index.ts
├── types.ts
├── services/
│   └── tenants.service.ts
├── stores/
│   └── tenant.ts
└── components/
    ├── TenantSwitcher.svelte
    ├── TenantSettings.svelte
    └── TenantMemberList.svelte
```

**類型定義**

```typescript
// src/lib/modules/tenants/types.ts
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: TenantPlan;
  settings: TenantSettings;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface TenantSettings {
  features: string[];
  limits: {
    maxUsers: number;
    maxSubscriptions: number;
    maxStorage: number;
  };
  branding?: {
    primaryColor: string;
    logo: string;
  };
}

export type TenantPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface TenantMember {
  userId: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}
```

**影響範圍**

- API 層：所有請求需帶 `X-Tenant-ID` header
- Store 層：新增 `currentTenant` store
- 路由：新增租戶切換邏輯
- UI：Header 新增租戶選擇器

---

### 12. 工作流程自動化

**概述**

實現規則引擎，支援自動化工作流程配置。

| 項目 | 說明 |
|------|------|
| 現有支援 | WebSocket 即時通知 |
| 需要新增 | 規則引擎、觸發器、動作定義 |
| 複雜度 | ⭐⭐⭐ 高 |
| 檔案數 | ~20 個 |

**目錄結構**

```
src/lib/modules/automation/
├── index.ts
├── types.ts
├── services/
│   ├── automation.service.ts
│   ├── trigger-engine.ts
│   └── action-executor.ts
└── components/
    ├── AutomationContent.svelte
    ├── WorkflowBuilder.svelte
    ├── TriggerSelector.svelte
    ├── ConditionBuilder.svelte
    ├── ActionSelector.svelte
    └── WorkflowHistory.svelte
```

**類型定義**

```typescript
// src/lib/modules/automation/types.ts
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: Record<string, unknown>;
}

export type TriggerType =
  | 'subscription_expiring'
  | 'subscription_created'
  | 'budget_exceeded'
  | 'user_created'
  | 'schedule';

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
  logic?: 'and' | 'or';
}

export interface WorkflowAction {
  type: ActionType;
  config: Record<string, unknown>;
}

export type ActionType =
  | 'send_notification'
  | 'send_email'
  | 'update_status'
  | 'assign_role'
  | 'webhook';
```

**範例工作流程**

```json
{
  "name": "訂閱到期提醒",
  "trigger": {
    "type": "subscription_expiring",
    "config": { "daysBefore": 7 }
  },
  "conditions": [
    { "field": "status", "operator": "equals", "value": "active" }
  ],
  "actions": [
    {
      "type": "send_notification",
      "config": {
        "title": "訂閱即將到期",
        "message": "{{subscription.name}} 將於 {{subscription.nextBillingDate}} 到期"
      }
    }
  ]
}
```

---

### 13. 審計日誌進階分析

**概述**

基於現有日誌系統，添加異常檢測和行為模式分析功能。

| 項目 | 說明 |
|------|------|
| 現有支援 | LogStats 已有基礎圖表 |
| 需要新增 | 異常檢測演算法、安全警報、分析儀表板 |
| 複雜度 | ⭐⭐⭐ 高 |
| 依賴 | 可能需要後端 ML 服務 |

**新增功能**

```typescript
// src/lib/modules/logs/types.ts (擴展)
export interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: AlertType;
  description: string;
  affectedUserId?: string;
  relatedLogs: string[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export type AlertType =
  | 'brute_force_attempt'
  | 'unusual_location'
  | 'mass_data_export'
  | 'privilege_escalation'
  | 'unusual_time_access';

export interface BehaviorPattern {
  userId: string;
  typicalLoginTimes: string[];
  typicalLocations: string[];
  averageSessionDuration: number;
  commonActions: string[];
}
```

---

## 新模組建議

### 14. 團隊管理模組

**用途**

組織架構管理、團隊成員分配、部門層級設定。

| 項目 | 說明 |
|------|------|
| 複雜度 | ⭐⭐ 中 |
| 與現有整合 | Users 模組、Roles 模組 |
| 檔案數 | ~12 個 |

**目錄結構**

```
src/lib/modules/teams/
├── index.ts
├── types.ts
├── services/
│   └── teams.service.ts
└── components/
    ├── TeamsContent.svelte
    ├── TeamDetailContent.svelte
    ├── TeamCard.svelte
    ├── TeamForm.svelte
    ├── TeamMemberList.svelte
    ├── TeamMemberInvite.svelte
    └── OrgChart.svelte
```

**類型定義**

```typescript
// src/lib/modules/teams/types.ts
export interface Team {
  id: string;
  name: string;
  description?: string;
  parentId?: string;       // 支援層級結構
  leaderId?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface TeamTree {
  team: Team;
  children: TeamTree[];
  members: User[];
}
```

---

### 15. 文件管理模組

**用途**

合約、收據、文件的上傳、分類和管理。

| 項目 | 說明 |
|------|------|
| 複雜度 | ⭐⭐ 中 |
| 依賴 | 檔案上傳 API、預覽功能 |
| 檔案數 | ~12 個 |

**目錄結構**

```
src/lib/modules/documents/
├── index.ts
├── types.ts
├── services/
│   ├── documents.service.ts
│   └── file-upload.ts
└── components/
    ├── DocumentsContent.svelte
    ├── DocumentGrid.svelte
    ├── DocumentCard.svelte
    ├── DocumentPreview.svelte
    ├── DocumentUploader.svelte
    └── DocumentFilters.svelte
```

**類型定義**

```typescript
// src/lib/modules/documents/types.ts
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  relatedTo?: {
    type: 'subscription' | 'user';
    id: string;
  };
  tags: string[];
  uploadedBy: string;
  createdAt: string;
}

export type DocumentType = 'contract' | 'receipt' | 'invoice' | 'other';
```

---

### 16. API 金鑰管理

**用途**

第三方整合的 API 金鑰產生、管理和存取控制。

| 項目 | 說明 |
|------|------|
| 複雜度 | ⭐⭐ 中 |
| 與現有整合 | Account 模組、Security |
| 檔案數 | ~8 個 |

**目錄結構**

```
src/lib/modules/api-keys/
├── index.ts
├── types.ts
├── services/
│   └── api-keys.service.ts
└── components/
    ├── ApiKeysContent.svelte
    ├── ApiKeyCard.svelte
    ├── ApiKeyCreateModal.svelte
    └── ApiKeyUsageStats.svelte
```

**類型定義**

```typescript
// src/lib/modules/api-keys/types.ts
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;      // 只顯示前幾字元
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  rateLimit: number;
  createdAt: string;
}

export interface ApiKeyUsage {
  date: string;
  requestCount: number;
  errorCount: number;
}
```

---

## 實作優先順序

### 優先級矩陣

| 優先級 | 功能 | 價值 | 複雜度 | 建議理由 |
|--------|------|------|--------|----------|
| **P0** | 即時通知推送 | 高 | 低 | WebSocket 已就緒，立即可用 |
| **P0** | 深色模式持久化 | 中 | 低 | 使用者體驗基本需求 |
| **P1** | 全域搜尋 | 高 | 中 | 大幅提升操作效率 |
| **P1** | 預算追蹤 | 高 | 中 | 訂閱管理核心功能延伸 |
| **P1** | 鍵盤快捷鍵 | 中 | 低 | 進階用戶體驗提升 |
| **P2** | 活動時間軸 | 中 | 中 | 增強系統可追溯性 |
| **P2** | 批量操作增強 | 中 | 中 | 提升管理效率 |
| **P2** | 自訂儀表板 | 中 | 中 | 個人化體驗 |
| **P3** | 報表產生器 | 高 | 高 | 企業級需求 |
| **P3** | 團隊管理 | 中 | 中 | 組織擴展需求 |
| **P3** | 文件管理 | 中 | 中 | 完整業務流程 |
| **P4** | 工作流程自動化 | 高 | 高 | 進階自動化需求 |
| **P4** | 多租戶 | 高 | 高 | SaaS 商業模式需求 |
| **P4** | 審計日誌分析 | 中 | 高 | 安全合規需求 |

### 建議開發路線圖

**第一階段 (1 週)**
- ✅ 即時通知推送
- ✅ 深色模式持久化
- ✅ 鍵盤快捷鍵

**第二階段 (2 週)**
- 🔄 全域搜尋
- 🔄 預算追蹤

**第三階段 (2 週)**
- 📋 活動時間軸
- 📋 批量操作增強

**第四階段 (3 週)**
- 📋 自訂儀表板
- 📋 報表產生器

**第五階段 (持續)**
- 📋 團隊管理
- 📋 文件管理
- 📋 工作流程自動化

---

## 開發指南

### 新增模組標準流程

**1. 建立目錄結構**

```bash
mkdir -p src/lib/modules/{module-name}/{components,services}
```

**2. 建立類型定義**

```typescript
// src/lib/modules/{module-name}/types.ts
export interface ModuleEntity {
  id: string;
  // ... 欄位定義
}

export interface ModuleFilters {
  search?: string;
  // ... 篩選條件
}
```

**3. 建立服務層**

```typescript
// src/lib/modules/{module-name}/services/{module}.service.ts
class ModuleService {
  // 業務邏輯方法
}

export const moduleService = new ModuleService();
```

**4. 建立 Content 組件**

```svelte
<!-- src/lib/modules/{module-name}/components/ModuleContent.svelte -->
<script lang="ts">
  interface Props {
    data: ModuleEntity[];
    loading?: boolean;
    // ... 其他 props
  }
</script>

<!-- UI 實作 -->
```

**5. 建立模組入口**

```typescript
// src/lib/modules/{module-name}/index.ts
export type { ModuleEntity, ModuleFilters } from './types';
export { moduleService } from './services/module.service';
export { default as ModuleContent } from './components/ModuleContent.svelte';

export const moduleConfig: ModuleConfig = {
  id: 'module-name',
  name: '模組名稱',
  basePath: '/path',
  navigation: [],
  enabled: true
};
```

**6. 註冊模組 (如需導航)**

```typescript
// src/lib/modules/index.ts
import { moduleConfig } from './{module-name}';
moduleRegistry.register(moduleConfig);
```

### 遵循既有模式

- 使用 Content Wrapper 模式封裝頁面 UI
- 使用 Props 回調傳遞事件 (`onSubmit`, `onChange`)
- Modal 保留在頁面層 (需要 `bind:open`)
- 服務層處理業務邏輯和資料轉換
- 使用 Svelte 5 Runes (`$state`, `$derived`, `$effect`)

---

## 附錄

### 相關文檔

- [01-專案架構文檔](./01-專案架構文檔.md)
- [02-開發規範指南](./02-開發規範指南.md)
- [03-API整合規範](./03-API整合規範.md)
- [04-元件設計文檔](./04-元件設計文檔.md)
- [05-部署與建置指南](./05-部署與建置指南.md)

### 技術資源

- [Svelte 5 文檔](https://svelte.dev/)
- [SvelteKit 文檔](https://kit.svelte.dev/)
- [Chart.js 文檔](https://www.chartjs.org/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
