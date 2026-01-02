# Architecture

This document describes the Ara Administration project architecture, including tech stack, directory structure, module system, and state management.

---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **SvelteKit** | 2.x | Full-stack framework |
| **Svelte** | 5.x | UI framework (Runes API) |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling system |
| **Vite** | 7.x | Build tool |

### Key Libraries

| Library | Purpose |
|---------|---------|
| **Chart.js** | Data visualization |
| **lucide-svelte** | Icon library |
| **Zod** | Schema validation |
| **dayjs** | Date manipulation |
| **PapaParse** | CSV processing |
| **xlsx** | Excel processing |

### Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **@testing-library/svelte** | Component testing |

---

## Directory Structure

```
src/
├── lib/
│   ├── components/          # UI Component Library
│   │   ├── ui/             # Base components (Button, Input, Modal...)
│   │   ├── layout/         # Layout components (Sidebar, Header...)
│   │   ├── forms/          # Form components (Select, DatePicker...)
│   │   ├── charts/         # Chart components
│   │   ├── data-display/   # Data visualization components
│   │   └── auth/           # Authentication components
│   │
│   ├── modules/            # Feature Modules
│   │   ├── dashboard/      # Dashboard module
│   │   ├── subscriptions/  # Subscription management
│   │   ├── notifications/  # Notification management
│   │   ├── users/          # User management
│   │   ├── roles/          # Role management
│   │   ├── logs/           # Audit logs
│   │   ├── account/        # Account settings
│   │   ├── settings/       # System settings
│   │   └── navigation/     # Navigation configuration
│   │
│   ├── services/           # API Service Layer
│   │   ├── core/           # Base API client
│   │   ├── auth/           # Authentication API
│   │   ├── users/          # Users API
│   │   ├── roles/          # Roles API
│   │   ├── subscriptions/  # Subscriptions API
│   │   ├── logs/           # Logs API
│   │   ├── dashboard/      # Dashboard API
│   │   ├── websocket.ts    # WebSocket service
│   │   └── push-notification.ts
│   │
│   ├── stores/             # State Management
│   │   ├── auth.ts         # Authentication state
│   │   ├── ui.ts           # UI state (sidebar, theme)
│   │   ├── toast.ts        # Toast notifications
│   │   └── notifications.ts
│   │
│   ├── types/              # TypeScript Types
│   │   ├── api.ts          # API types
│   │   ├── components.ts   # Component types
│   │   ├── models.ts       # Domain models
│   │   └── ui.ts           # UI types
│   │
│   ├── utils/              # Utilities
│   │   ├── index.ts        # cn() for Tailwind
│   │   ├── export.ts       # Export utilities
│   │   ├── error.ts        # Error handling
│   │   └── theme.ts        # Theme utilities
│   │
│   ├── constants/          # Application constants
│   ├── permissions.ts      # Permission utilities
│   └── mock/               # Mock API for demo mode
│
├── routes/                 # SvelteKit Routes
│   ├── (auth)/            # Auth pages (login, forgot-password)
│   │   ├── login/
│   │   └── forgot-password/
│   └── (app)/             # Main app pages
│       ├── dashboard/
│       ├── subscriptions/
│       ├── notifications/
│       └── settings/
│
└── app.html               # HTML entry point
```

---

## Module System

### Module Structure

Each feature module follows a standardized structure:

```
modules/{module-name}/
├── index.ts              # Module exports
├── types.ts              # Module-specific types
├── services/             # Module services
│   └── api.ts
└── components/           # Module components
    ├── {Name}Page.svelte
    ├── {Name}Content.svelte
    └── ...
```

### Content Wrapper Pattern

Pages use a separation of concerns pattern:

```svelte
<!-- +page.svelte - handles state and API calls -->
<script lang="ts">
  import { SubscriptionContent } from '$lib/modules/subscriptions';

  let subscriptions = $state([]);

  async function loadData() {
    subscriptions = await subscriptionService.list();
  }
</script>

<SubscriptionContent {subscriptions} onRefresh={loadData} />

<!-- Content.svelte - handles presentation -->
<script lang="ts">
  let { subscriptions, onRefresh } = $props();
</script>

<div>
  <!-- UI rendering -->
</div>
```

### Module Registration

Modules are registered in the navigation system:

```typescript
// src/lib/modules/navigation/config.ts
export const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: CreditCard,
    path: '/subscriptions',
  },
  // ...
];
```

---

## State Management

### Svelte 5 Runes

The project uses Svelte 5's Runes API:

```svelte
<script lang="ts">
  // Reactive state
  let count = $state(0);

  // Derived values
  let doubled = $derived(count * 2);

  // Side effects
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### Global Stores

Global state is managed with Svelte stores:

```typescript
// src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: null,
    permissions: [],
  });

  return {
    subscribe,
    login: async (credentials) => { /* ... */ },
    logout: () => { /* ... */ },
    hasPermission: (permission) => { /* ... */ },
  };
}

export const authStore = createAuthStore();
```

### Store Types

| Store | Purpose |
|-------|---------|
| `authStore` | User authentication, permissions |
| `uiStore` | Sidebar state, theme |
| `toastStore` | Toast notifications |
| `notificationStore` | Notification list |

---

## Routing

### Route Groups

SvelteKit route groups organize pages:

```
routes/
├── (auth)/              # Unauthenticated routes
│   ├── login/
│   └── forgot-password/
└── (app)/               # Authenticated routes (with layout)
    ├── +layout.svelte   # Main layout with sidebar
    ├── dashboard/
    └── subscriptions/
```

### Auth Guards

Authentication is enforced at the layout level:

```svelte
<!-- (app)/+layout.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  $effect(() => {
    if (!$authStore.token) {
      goto('/login');
    }
  });
</script>
```

### Permission Guards

Page-level permission checking:

```svelte
<script lang="ts">
  import { hasPermission } from '$lib/permissions';

  if (!hasPermission('users.manage')) {
    // Redirect or show error
  }
</script>
```

---

## Real-time Features

### WebSocket Integration

```typescript
// src/lib/services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;

  connect(token: string) {
    this.ws = new WebSocket(`${WS_URL}?token=${token}`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };
  }

  private handleMessage(data: any) {
    if (data.type === 'notification') {
      notificationStore.add(data.payload);
    }
  }
}
```

---

## Path Aliases

Configured in `svelte.config.js`:

| Alias | Path |
|-------|------|
| `$lib` | `src/lib` |
| `$components` | `src/lib/components` |
| `$stores` | `src/lib/stores` |
| `$services` | `src/lib/services` |
| `$utils` | `src/lib/utils` |
| `$types` | `src/lib/types` |

---

## Related Documentation

- [Development Guide](./02-development-guide.md)
- [API Integration](./03-api-integration.md)
- [Component Design](./04-component-design.md)
