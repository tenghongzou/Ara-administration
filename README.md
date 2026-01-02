# Ara Administration

基於 SvelteKit 2 + Svelte 5 的現代化管理後台，提供訂閱管理、使用者管理、通知系統等完整功能。

A modern administration dashboard built with SvelteKit 2 + Svelte 5, featuring subscription management, user management, notification system, and more.

---

## 技術棧 | Tech Stack

| 技術 | 版本 | 說明 |
|------|------|------|
| SvelteKit | 2.x | 全端框架 |
| Svelte | 5.x | UI 框架（Runes API） |
| TypeScript | 5.x | 型別安全 |
| Tailwind CSS | 4.x | 樣式系統 |
| Vite | 7.x | 建置工具 |
| Vitest | 4.x | 單元測試 |
| Playwright | 1.x | E2E 測試 |

---

## 快速開始 | Quick Start

### 環境需求 | Requirements

- Node.js >= 20
- pnpm >= 9（推薦）

### 使用 Docker（推薦）| Using Docker (Recommended)

從專案根目錄執行：

```bash
# 啟動所有服務
make up

# 存取管理後台
open http://localhost:3000
```

### 本地開發 | Local Development

```bash
cd administration

# 安裝相依套件
pnpm install

# 複製環境設定檔
cp .env.example .env

# 啟動開發伺服器
pnpm dev
```

存取 http://localhost:3000

---

## 專案結構 | Project Structure

```
administration/
├── src/
│   ├── lib/
│   │   ├── components/     # UI 元件庫
│   │   │   ├── ui/        # 基礎元件（Button, Input, Modal...）
│   │   │   ├── layout/    # 版面元件（Sidebar, Header...）
│   │   │   ├── forms/     # 表單元件
│   │   │   └── charts/    # 圖表元件
│   │   ├── modules/       # 功能模組
│   │   │   ├── dashboard/
│   │   │   ├── subscriptions/
│   │   │   ├── notifications/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── logs/
│   │   │   ├── account/
│   │   │   └── settings/
│   │   ├── services/      # API 服務層
│   │   ├── stores/        # Svelte 5 狀態管理
│   │   ├── types/         # TypeScript 型別
│   │   └── utils/         # 工具函式
│   └── routes/            # SvelteKit 頁面路由
│       ├── (auth)/        # 認證頁面（登入、忘記密碼）
│       └── (app)/         # 主應用程式頁面
├── tests/
│   ├── unit/             # 單元測試
│   └── e2e/              # E2E 測試
├── static/               # 靜態資源
└── docs/                 # 技術文件
```

---

## 主要功能模組 | Main Modules

| 模組 | 說明 | Description |
|------|------|-------------|
| **Dashboard** | 儀表板統計與快速操作 | Dashboard stats and quick actions |
| **Subscriptions** | 訂閱管理（CRUD、分析、行事曆、匯入匯出） | Subscription management with analytics |
| **Notifications** | 通知管理與即時推播 | Notification management with real-time push |
| **Users** | 使用者管理 | User management |
| **Roles** | 角色與權限管理 | Role & permission management |
| **Logs** | 系統稽核日誌 | System audit logs |
| **Account** | 個人帳號設定（2FA、密碼、Session） | Account settings with 2FA |
| **Settings** | 系統設定 | System settings |

---

## 開發指令 | Development Commands

```bash
pnpm dev              # 開發伺服器（port 3000）
pnpm build            # 生產建置
pnpm preview          # 預覽建置結果
pnpm check            # TypeScript 型別檢查
pnpm lint             # ESLint 檢查
pnpm test             # 執行測試（watch 模式）
pnpm test:unit        # 執行單元測試
pnpm test:coverage    # 測試覆蓋率報告
pnpm test:e2e         # E2E 測試
```

---

## 環境變數 | Environment Variables

```env
# API 設定
VITE_API_HOST=http://localhost        # API 主機
VITE_API_VERSION=v1                   # API 版本

# WebSocket 設定
VITE_WS_URL=ws://localhost:8081/ws    # WebSocket URL

# 應用程式設定
VITE_APP_NAME=Ara Admin               # 應用程式名稱
VITE_APP_VERSION=1.0.0                # 應用程式版本
VITE_APP_ENV=development              # 環境模式（支援 demo_mock）
VITE_DEBUG=true                       # 除錯模式
```

---

## 文件 | Documentation

詳細文件請參閱 `docs/` 資料夾：

| 語言 | 路徑 |
|------|------|
| 繁體中文 | [docs/zh-TW/](./docs/zh-TW/README.md) |
| English | [docs/en/](./docs/en/README.md) |

### 文件目錄 | Documentation Index

- **專案架構** / Architecture - 技術棧、目錄結構、模組系統
- **開發規範** / Development Guide - 程式碼規範、Svelte 5 最佳實踐
- **API 整合** / API Integration - 服務層設計、認證機制
- **元件設計** / Component Design - UI 元件庫、設計系統
- **部署指南** / Deployment - 建置流程、Docker 部署

---

## 授權 | License

Private - All Rights Reserved
