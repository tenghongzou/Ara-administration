# Ara Administration Technical Documentation

Welcome to the Ara Administration technical documentation. This documentation covers project architecture, development guidelines, API integration, component design, and deployment.

---

## Documentation Index

### Core Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./01-architecture.md) | Tech stack, directory structure, module system, state management |
| [Development Guide](./02-development-guide.md) | Naming conventions, TypeScript rules, Svelte 5 best practices |
| [API Integration](./03-api-integration.md) | API client design, authentication, service layer, error handling |
| [Component Design](./04-component-design.md) | UI component library, design system, design tokens |
| [Deployment Guide](./05-deployment-guide.md) | Build process, Docker deployment, CI/CD, monitoring |
| [Feature Roadmap](./06-feature-roadmap.md) | Future feature planning, extension architecture |

---

## Quick Navigation

### I'm new, where do I start?

1. Read [Architecture](./01-architecture.md) to understand the system structure
2. Check [Development Guide](./02-development-guide.md) for coding standards
3. Follow [Deployment Guide](./05-deployment-guide.md) to set up your environment

### I want to develop new components?

1. Read [Component Design](./04-component-design.md) for the design system
2. Check [Development Guide](./02-development-guide.md) for Svelte 5 conventions
3. Browse existing components in `src/lib/components/`

### I want to integrate with backend API?

1. Read [API Integration](./03-api-integration.md) for service layer design
2. Reference existing services in `src/lib/services/`

---

## Project Highlights

### Technical Features

- **Svelte 5 Runes**: Latest Runes API ($state, $derived, $effect)
- **Modular Architecture**: Independent, extensible feature modules
- **Type Safety**: Complete TypeScript coverage
- **Real-time**: WebSocket for live notifications
- **Dark Mode**: System theme auto-detection

### Feature Modules

| Module | Description |
|--------|-------------|
| Dashboard | Statistics, quick actions, activity feed |
| Subscriptions | CRUD, analytics, calendar, import/export |
| Notifications | List, filtering, batch operations, real-time push |
| Users | User CRUD, role assignment, status management |
| Roles | Role CRUD, permission group management |
| Logs | Audit logs, full-text search, export |
| Account | Profile, password, 2FA, session management |
| Settings | System settings, theme, notification preferences |

---

## Related Links

- [繁體中文文件](../zh-TW/README.md)
- [Project README](../../README.md)
