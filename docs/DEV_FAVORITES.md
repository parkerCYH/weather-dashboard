# Dev Plan: Favorites — Migrate to PostgreSQL (v2)

## Overview

將已登入使用者的收藏從 **Upstash Redis** 改為 **PostgreSQL**，充分利用已存在的 `Place` 資料表。
新增 `UserFavorite` join table（`User` ↔ `Place`），並將 `Place.osmId` 從 `BigInt` 改為 `String`，使其同時支援 OSM ID（純數字）與 PlaceCard 合成座標 ID（`"25.0478_121.5319"` 格式）。

訪客收藏維持 **Zustand + localStorage**（上限 3 筆），登入後清空，不同步。

---

## Scope

### Included
- Prisma schema 修改：`Place.osmId` BigInt → String（含 migration）
- Prisma schema 新增：`UserFavorite` model（`User` ↔ `Place` join table）
- `app/api/places/route.ts`：移除 `BigInt(osmId)` 轉換（改用 String）
- `app/api/favorites/route.ts`：完全改用 Prisma（移除所有 Redis 相關程式碼）
- `tests/unit/api/favorites.test.ts`：重寫 mock（vi.mock Prisma 而非 Redis）
- E2E tests：重跑確認仍通過（API 行為不變，mock HTTP layer 不受影響）

### Out of Scope
- 訪客收藏邏輯（localStorage + Zustand），不動
- `FavoritesList.tsx`、`PlaceSearchItem.tsx`、`PlaceCard.tsx`、`useFavorites.ts`（hook 層不動，因為 API 回傳格式不變）
- Redis 本身（仍用於 rate limiting，只移除收藏相關的 redis 呼叫）

---

## Schema Design

### 修改 Place model
```prisma
model Place {
  id        BigInt         @id @default(autoincrement())
  osmType   String
  osmId     String         // ← 由 BigInt 改為 String（支援 "coord" 合成 ID）
  name      String
  class     String
  type      String
  lat       Float
  lon       Float
  source    String
  favorites UserFavorite[]

  @@unique([osmType, osmId], name: "unique_osm")
  @@index([osmType, osmId], name: "idx_osm")
  @@index([name], name: "idx_name")
  @@map("places")
}
```

### 新增 UserFavorite model
```prisma
model UserFavorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  placeId   BigInt
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, placeId])
  @@index([userId])
  @@map("user_favorites")
}
```

### User model 新增 back-relation
```prisma
favorites UserFavorite[]
```

---

## Implementation Steps

1. **`prisma/schema.prisma`** — 修改 `Place.osmId`（BigInt → String），新增 `UserFavorite`，在 `User` 加 `favorites` back-relation
2. **migration** — `pnpm prisma migrate dev --name migrate_favorites_to_postgres`
3. **`app/api/places/route.ts`** — 移除 `BigInt(osmId)` 轉換，改傳 `osmId` 字串；移除 `existing.osmId.toString()`
4. **`app/api/favorites/route.ts`** — 全面改用 Prisma：
   - `GET`: `prisma.userFavorite.findMany({ where: { userId }, include: { place: true } })`，轉換成 `PlaceResult[]` 回傳
   - `POST`: 先 upsert Place（`prisma.place.upsert`），再 check count（`prisma.userFavorite.count`），再 create UserFavorite
   - `DELETE`: `prisma.userFavorite.deleteMany({ where: { userId, place: { osmType, osmId } } })`
5. **`tests/unit/api/favorites.test.ts`** — 重寫：`vi.mock("@/lib/prisma")` 取代 Redis mock，重建 9 個測試案例
6. **驗證** — `pnpm tsc --noEmit`、`pnpm test:unit:favorites`、`pnpm test:e2e:favorites`

---

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `prisma/schema.prisma` | Modify | Place.osmId BigInt→String；新增 UserFavorite；User back-relation |
| `prisma/migrations/...` | Create | 自動產生 migration SQL |
| `app/api/places/route.ts` | Modify | 移除 BigInt() 轉換 |
| `app/api/favorites/route.ts` | Rewrite | Redis → Prisma |
| `tests/unit/api/favorites.test.ts` | Rewrite | Redis mock → Prisma mock |

---

## API Behavior（不變，前端無感）

| Method | Success | Error cases |
|--------|---------|-------------|
| GET | `{ favorites: PlaceResult[] }` 200 | 401 unauthenticated |
| POST | `{ message: "Added", place }` 200 | 401, 400 missing fields, 409 limit |
| DELETE | `{ message: "Removed" }` 200 | 401, 400 missing fields |

---

## Unit Test Plan

### Test File
`tests/unit/api/favorites.test.ts`（重寫）

### Test Cases
| # | Handler | 情境 | 預期 |
|---|---------|------|------|
| 1 | GET | 未登入 | 401 |
| 2 | GET | 已登入，無收藏 | `{ favorites: [] }` |
| 3 | GET | 已登入，有收藏 | `{ favorites: [PLACE] }` |
| 4 | POST | 未登入 | 401 |
| 5 | POST | 已登入，正常新增 | 200，prisma.place.upsert + prisma.userFavorite.create 被呼叫 |
| 6 | POST | 已達上限 10 筆 | 409 |
| 7 | POST | 缺少必要欄位 | 400 |
| 8 | DELETE | 未登入 | 401 |
| 9 | DELETE | 已登入，正常移除 | 200，prisma.userFavorite.deleteMany 被呼叫 |

### package.json Script
```json
"test:unit:favorites": "vitest run tests/unit/api/favorites.test.ts"
```

---

## E2E Test Plan

### Test File
`tests/e2e/favorites.spec.ts`（已存在，不修改）

所有測試均 mock HTTP endpoints，與儲存層無關，預期直接通過。

### package.json Script
```json
"test:e2e:favorites": "playwright test tests/e2e/favorites.spec.ts --reporter=list --workers=1"
```

---

## Open Questions
- 無。migration 執行後 `place.osmId` 列的現有值會由 DB 自動 CAST（BigInt 轉 text）

- 分頁
- 推播通知

---

## Redis Schema

### Key 設計

| Key pattern | Type | 用途 |
|-------------|------|------|
| `weather:favorites:{userId}` | **Hash** | 儲存該使用者的所有收藏地點 |

### Hash 結構

```
HSET weather:favorites:{userId}
  "{osmType}:{osmId}"  '{ "osmType":"relation","osmId":"3349525","name":"Taipei, Taiwan","class":"boundary","type":"administrative","lat":25.0478,"lon":121.5319,"source":"Nominatim" }'
```

- **Field**：`{osmType}:{osmId}` — 全域唯一識別碼，便於 `HEXISTS` 查詢及 `HDEL` 刪除
- **Value**：JSON 字串，內容同 `PlaceResult` interface
- **TTL**：不設 expire（使用者個人資料，長期保留）
- **上限**：單一使用者最多 **10 筆**（在 POST API 加 `HLEN` guard，超過回 `409`）

### Redis 操作對照

| 動作 | Redis 指令 |
|------|-----------|
| 新增 | `HSET weather:favorites:{userId} {key} {json}` |
| 刪除 | `HDEL weather:favorites:{userId} {key}` |
| 查詢全部 | `HGETALL weather:favorites:{userId}` |
| 查詢是否收藏 | `HEXISTS weather:favorites:{userId} {key}` |

---

## API Design

### `GET /api/favorites`
- **Auth**: 必須登入（未登入回 401）
- **Response**: `{ favorites: PlaceResult[] }`
- 從 `HGETALL` 取回所有 values，parse JSON，回傳陣列

### `POST /api/favorites`
- **Auth**: 必須登入
- **Body**: `PlaceResult` 物件（osmType, osmId, name, class, type, lat, lon, source）
- **Guards**: 欄位驗證 + `HLEN` ≤ **10** guard
- **Response**: `{ message: "Added", place: PlaceResult }`
- 執行 `HSET`（若已存在則 idempotent）

### `DELETE /api/favorites`
- **Auth**: 必須登入
- **Body**: `{ osmType: string; osmId: string }`
- **Response**: `{ message: "Removed" }`
- 執行 `HDEL`（若不存在也視為成功）

---

## Implementation Steps

1. **`lib/stores/favoritesStore.ts`** — Zustand store，管理訪客收藏（`favorites: PlaceResult[]`）；使用 `zustand/middleware` 的 `persist` 持久化至 localStorage（key: `weather-guest-favorites`）；上限 3 筆
2. **`app/api/favorites/route.ts`** — 建立 GET + POST + DELETE 三個 handler，Auth guard（未登入回 401）；Redis Hash 操作；POST 加 `HLEN ≤ 10` guard
3. **`lib/hooks/useFavorites.ts`** — 統一 hook 入口：session 存在時使用 React Query 打 API，session 為 null 時讀寫 Zustand store；`useIsFavorite(place)` 輔助 hook
4. **`components/form/PlaceSearchItem.tsx`** — 在每筆搜尋結果右側加入 Star 按鈕，呼叫 `useAddFavorite`/`useRemoveFavorite`，採 Optimistic Update；已收藏顯示實心星 `StarFill`，未收藏顯示空心星 `Star`
5. **`app/weather-dashboard/_cards/PlaceCard.tsx`** — Bookmark Save 按鈕連接 `useAddFavorite`；`useIsFavorite` 判斷是否已收藏（已收藏則顯示 `BookmarkCheck`）；`isGuest` prop 保留但不再禁用，訪客改存 localStorage
6. **`app/page.tsx`** — 新增 `<FavoritesList>` client component，讀取 `useFavorites()` 資料；顯示各收藏地點名稱 + 快速連結；空狀態顯示「你還沒有收藏的地點，快去搜尋吧！」；session 登入後呼叫 `useFavoritesStore.getState().clear()` 清空 localStorage
7. **`tests/unit/api/favorites.test.ts`** — Vitest unit tests，mock `redis` 與 `getServerAuthSession`，測試三個 handler 的邏輯（見 Unit Test Plan）

---

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `lib/stores/favoritesStore.ts` | **Create** | Zustand + persist，訪客 localStorage，上限 3 |
| `app/api/favorites/route.ts` | **Create** | GET + POST + DELETE，Auth guard，上限 10 |
| `lib/hooks/useFavorites.ts` | **Create** | 統一 hook，session-aware（Zustand vs React Query）|
| `components/form/PlaceSearchItem.tsx` | **Modify** | 新增 Star toggle 按鈕，Optimistic Update |
| `app/weather-dashboard/_cards/PlaceCard.tsx` | **Modify** | Bookmark 按鈕連接 `useAddFavorite`，移除訪客禁用限制 |
| `app/page.tsx` | **Modify** | 新增收藏清單 Card，空狀態，登入後清空 localStorage |
| `tests/unit/api/favorites.test.ts` | **Create** | Vitest unit tests for API handlers |

---

## Unit Test Plan (Vitest)

### Test File
`tests/unit/api/favorites.test.ts`

### Strategy

使用 `vi.mock()` mock `@/lib/redis` 與 `@/lib/getServerAuthSession`，直接呼叫 API handler function，不啟動 HTTP server，不依賴真實 Redis。

### Test Cases

| # | 描述 | Mock | 預期 |
|---|------|------|------|
| 1 | GET — 未登入回 401 | session = null | `{ status: 401 }` |
| 2 | GET — 已登入，Redis 空 Hash | session ok, hgetall = {} | `{ favorites: [] }` |
| 3 | GET — 已登入，Redis 有資料 | session ok, hgetall = { key: jsonStr } | `{ favorites: [place] }` |
| 4 | POST — 未登入回 401 | session = null | `{ status: 401 }` |
| 5 | POST — 已登入，正常新增 | hlen = 0, hset ok | `{ message: "Added" }`，hset 被呼叫 |
| 6 | POST — 已達上限 10 筆回 409 | hlen = 10 | `{ status: 409 }` |
| 7 | POST — 缺少必要欄位回 400 | — | `{ status: 400 }` |
| 8 | DELETE — 未登入回 401 | session = null | `{ status: 401 }` |
| 9 | DELETE — 正常移除 | session ok, hdel ok | `{ message: "Removed" }` |

---

## E2E Test Plan (Playwright)

### Test File
`tests/e2e/favorites.spec.ts`

### Strategy

由於 GitHub OAuth 無法在 CI 中直接登入，測試分兩層：
1. **Auth mock layer** — 用 `page.route` 攔截 `/api/auth/session`，回傳假的登入 session（userId = `test-user-123`）
2. **API mock layer** — 攔截 `/api/favorites`，回傳可控的假資料，不依賴實際 Redis

訪客測試直接操作 `localStorage`（`evaluate` 注入初始值），不需要 mock。

### Test Cases

| # | 描述 | 步驟 | 預期 |
|---|------|------|------|
| 1 | 訪客可直接點擊星星新增收藏 | goto `/`，mock DB 搜尋空結果，Load more，點星星 | 星星變實心；localStorage `weather-guest-favorites` 含該地點 |
| 2 | 訪客收藏滿 3 筆後星星禁用 | 預填 localStorage 3 筆，搜尋，查看未收藏項目的星星 | 星星顯示 `disabled` |
| 3 | 訪客 Homepage 顯示收藏清單 | 預填 localStorage 1 筆，goto `/` | 頁面顯示該地點名稱與快速連結 |
| 4 | 訪客 Homepage 顯示空狀態文字 | localStorage 為空，goto `/` | 顯示「你還沒有收藏的地點，快去搜尋吧！」 |
| 5 | 已登入可點擊星星 → POST /api/favorites | mock session + favorites API，搜尋後點星星 | 攔截到 POST 請求，body 含正確 place 資料 |
| 6 | 點擊已收藏的星星 → DELETE /api/favorites | mock session，favorites 預設含此地點，點星星 | 攔截到 DELETE 請求，星星變空心 |
| 7 | 已登入 Homepage 顯示 Redis 收藏清單 | mock session + GET favorites 回傳 1 筆 | 頁面顯示該地點名稱與快速連結 |
| 8 | PlaceCard Bookmark 按鈕呼叫收藏 API | mock session，goto `/weather-dashboard?lat=...&lon=...`，mock weather API | 點 Save 後攔截到 POST /api/favorites |

### package.json Scripts
```json
"test:unit:favorites": "vitest run tests/unit/api/favorites.test.ts",
"test:e2e:favorites": "playwright test tests/e2e/favorites.spec.ts --reporter=list --workers=1"
```

---

## 確認事項

| 項目 | 決定 |
|------|------|
| 訪客收藏上限 | **3 筆**，存 localStorage，Zustand 管理 |
| 已登入收藏上限 | **10 筆**，存 Redis Hash |
| 登入後處理 | 清空 localStorage（不同步）|
| 圖示語義 | 搜尋結果用 **Star**，PlaceCard 用 **Bookmark** |
| 視覺回饋 | **Optimistic Update**（立即 toggle，失敗 rollback）|
| Homepage 空狀態 | 顯示「你還沒有收藏的地點，快去搜尋吧！」（訪客與登入者皆顯示）|
| 收藏清單位置 | Alert 下方獨立 `<Card>`；訪客也顯示（讀 localStorage）|
