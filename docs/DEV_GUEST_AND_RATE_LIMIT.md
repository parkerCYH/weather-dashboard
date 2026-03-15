# Dev Plan: Guest Access + API Rate Limiting

## Overview

兩個獨立的功能：
1. **訪客模式** — 讓未登入的用戶也能使用天氣儀表板，不強制要求 GitHub OAuth。登入後可解鎖額外功能（如儲存地點）。
2. **API Rate Limiting Middleware** — 在 Next.js middleware 層攔截所有 `/api/*` 請求，每個 IP 每小時最多 50 次，超過回傳 `429 Too Many Requests`。

---

## Scope

### 包含
- 移除 `/` 和 `/weather-dashboard` 的強制登入 redirect
- 登入頁新增「以訪客身份繼續」按鈕
- Header 根據 session 狀態顯示不同 UI（已登入 / 訪客）
- 建立 `middleware.ts`，使用 `@upstash/ratelimit` 對 API 進行速率限制
- 速率限制排除 `/api/auth/*` 和 `/api/cron/*`

### 不包含
- 訪客用戶的任何 DB 儲存（訪客不建立任何 Session/User 記錄）
- 訪客專屬的功能限制頁面（只做 conditional UI，不做獨立路由）
- 修改現有 GitHub OAuth 流程

---

## Implementation Steps

### Part 1 — 訪客模式

**Step 1.1** — 安裝無額外 package（不需要額外安裝）

**Step 1.2** — 修改 `app/page.tsx`
- 移除 `if (!session) redirect("/login")` auth gate
- 改為：若有 session 則顯示完整功能，無 session 顯示帶有「訪客模式」提示的版本

**Step 1.3** — 修改 `app/weather-dashboard/page.tsx`
- 移除強制 redirect 到登入頁
- 無 session 時仍顯示天氣資料，但隱藏需要 auth 的 UI 元素（如儲存地點）

**Step 1.4** — 修改 `app/login/page.tsx`
- 新增「以訪客身份繼續 →」按鈕（link 到 `/`）
- 放在現有 GitHub 登入按鈕下方

**Step 1.5** — 修改 `components/Header.tsx`
- 訪客狀態時顯示「訪客」badge + 「登入」按鈕
- 已登入時顯示現有的用戶資訊 UI

---

### Part 2 — Rate Limiting Middleware

**Step 2.1** — 安裝 `@upstash/ratelimit`
```
pnpm add @upstash/ratelimit
```

**Step 2.2** — 建立 `middleware.ts`（專案根目錄）
- 使用 `@upstash/ratelimit` 的 `SlidingWindow(50, "1 h")` 演算法
- 以 `X-Forwarded-For` 或 `x-real-ip` 作為 key（fallback 到 `"anonymous"`）
- `matcher` 設定：`/api/:path*`，但排除 `/api/auth/:path*` 和 `/api/cron/:path*`
- 被限制時回傳 `Response` with status `429`，body `{ error: "Rate limit exceeded" }`，並附上 `Retry-After` header

**Step 2.3** — 不修改 `env.ts`（`UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 已存在）

---

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `middleware.ts` | **Create** | rate limiting，matcher 設 api 路由 |
| `app/page.tsx` | **Modify** | 移除 auth redirect，加訪客 UI |
| `app/weather-dashboard/page.tsx` | **Modify** | 移除 auth redirect |
| `app/login/page.tsx` | **Modify** | 新增 Guest 按鈕 |
| `components/Header.tsx` | **Modify** | 訪客狀態 UI |
| `package.json` / `pnpm-lock.yaml` | **Auto-update** | 安裝 `@upstash/ratelimit` |

**不修改：** `lib/auth.ts`、`env.ts`、任何 API routes

---

## Middleware 設計細節

```ts
// middleware.ts (概念)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "1 h"),
  prefix: "weather:ratelimit",
});

// matcher: ["/(api)/((?!auth|cron).*)"]
// 從 request headers 取得 IP → ratelimit.limit(ip)
// 若 success === false → return new Response(JSON, { status: 429 })
```

> **注意：** `Redis.fromEnv()` 會讀取 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`，與現有 `lib/redis.ts` 共用同一個 Redis instance。

---

## E2E Test Plan

### Test File
`tests/e2e/guest-and-rate-limit.spec.ts`

### Test Cases

| # | Description | Steps | Expected |
|---|-------------|-------|----------|
| 1 | 訪客可直接訪問首頁 | 1. `goto('/')` 不登入 | 顯示首頁，無 redirect 到 `/login` |
| 2 | 登入頁顯示訪客按鈕 | 1. `goto('/login')` | 看到「以訪客身份繼續」按鈕 |
| 3 | 訪客按鈕可跳轉首頁 | 1. `goto('/login')` 2. click 訪客按鈕 | redirect 到 `/` |
| 4 | Rate limit 正常觸發 | 1. 連續送出 51 次 `GET /api/weather?...` | 第 51 次回傳 `429` |
| 5 | Auth 路由不受 rate limit 影響 | 1. 連續打 `/api/auth/session` 超過 50 次 | 不回傳 429 |

### package.json Script
```json
"test:e2e:guest-rate-limit": "playwright test tests/e2e/guest-and-rate-limit.spec.ts --reporter=list --workers=1"
```

---

## Open Questions — 已確認

1. ✅ **訪客可以看天氣資料** — 訪客可查詢任意地點天氣。「儲存地點」按鈕改為灰色 disabled 狀態，點擊後彈出 `Dialog`/`Tooltip` 提示「登入後即可儲存最愛地點」，起到導流登入的作用。
2. ✅ **Rate limit 只做 IP-based** — 從 `X-Forwarded-For` / `x-real-ip` 取 IP 為 key。未來擴充時可改為 `const key = userId ?? ip`。
3. ✅ **`/api/suggestion`、`/api/countries` 等全部受限** — 所有 `/api/*`（除 `/api/auth/*` 和 `/api/cron/*`）皆套用 50 req / 1h 限制，防止 AI 額度被刷爆。
