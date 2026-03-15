# Dev Plan: 測試框架遷移 — Jest → Vitest + Playwright

## Overview

目前專案有 Jest 設定但完全沒有任何測試。趁此機會直接換成與 Next.js App Router / ESM 更相容的 **Vitest**，並同時安裝 **Playwright** 作為 E2E 框架（取代未安裝的 Playwright）。遷移完成後 `package.json` 的 `test:unit` 指令跑 Vitest，`test:e2e:*` 指令跑 Playwright。

---

## Scope

### 包含
- 移除所有 Jest 相關 packages 與設定檔
- 安裝 Vitest、@vitejs/plugin-react、vitest-environment-jsdom
- 安裝 Playwright（`@playwright/test`）
- 建立 `vitest.config.ts`
- 建立 `playwright.config.ts`
- 更新 `package.json` scripts

### 不包含
- 撰寫功能性測試案例（留給各 feature dev plan 負責）
- 修改任何 production 程式碼

---

## Implementation Steps

### Step 1 — 移除 Jest

移除以下 devDependencies：
```
jest
jest-environment-jsdom
@types/jest
ts-node   ← 只在 jest 使用，tsx 已取代
```

保留（其他用途）：
```
@testing-library/dom
@testing-library/jest-dom   ← vitest 繼承其 matchers
@testing-library/react
```

刪除 `jest.config.ts`。

---

### Step 2 — 安裝 Vitest

```bash
pnpm add -D vitest @vitejs/plugin-react vitest-environment-jsdom @vitest/coverage-v8
```

> `vitest-environment-jsdom` 提供瀏覽器環境，等同於 `jest-environment-jsdom`。

---

### Step 3 — 建立 `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

---

### Step 4 — 建立 `vitest.setup.ts`

```ts
import "@testing-library/jest-dom";
```

---

### Step 5 — 安裝 Playwright

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

---

### Step 6 — 建立 `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

---

### Step 7 — 建立 Vitest Smoke Test

建立 `tests/unit/health.test.ts`：

```ts
import { describe, it, expect } from "vitest";

describe("Server Health", () => {
  it("API base URL env variable is defined", () => {
    // 確認執行環境可以讀取設定，不依賴 DB 或外部服務
    const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
    expect(url).toMatch(/^https?:\/\//); 
  });

  it("basic arithmetic works (vitest is running)", () => {
    expect(1 + 1).toBe(2);
  });
});
```

> 這個測試不需要 DB/Redis/外部 API，純粹確認 Vitest 環境運作正常。

---

### Step 8 — 建立 Playwright Smoke Test

建立 `tests/e2e/homepage.spec.ts`：

```ts
import { test, expect } from "@playwright/test";

// NOTE: 首頁目前需要登入，smoke test 以 /login 頁面驗證 Playwright 安裝正常。
// 待 guest 功能上線後，此 spec 將更新為測試未登入訪客直接進入首頁。
test.describe("首頁 Smoke Test", () => {
  test("未登入時 / 會 redirect 到登入頁並顯示標題", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Log in to Dashboard/i })).toBeVisible();
  });

  test("登入頁包含 GitHub 登入按鈕", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Continue with GitHub/i })).toBeVisible();
  });
});
```

---

### Step 9 — 更新 `package.json` scripts

移除：
```json
"test": "jest",
"test:watch": "jest --watch"
```

新增：
```json
"test:unit": "vitest run",
"test:unit:watch": "vitest",
"test:unit:coverage": "vitest run --coverage",
"test:e2e:homepage": "playwright test tests/e2e/homepage.spec.ts --reporter=list --workers=1"
```

> 其他 feature 的 `test:e2e:*` 指令由各 feature dev plan 各自新增。

---

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `jest.config.ts` | **Delete** | 不再需要 |
| `vitest.config.ts` | **Create** | Vitest 設定 |
| `vitest.setup.ts` | **Create** | 匯入 jest-dom matchers |
| `playwright.config.ts` | **Create** | Playwright E2E 設定 |
| `tests/unit/health.test.ts` | **Create** | Vitest smoke test |
| `tests/e2e/homepage.spec.ts` | **Create** | Playwright smoke test |
| `package.json` | **Modify** | 移除 jest scripts，新增 vitest/playwright scripts |

---

## Verification

### Smoke Checks
```bash
pnpm test:unit                   # Vitest smoke test 通過
pnpm test:e2e:homepage           # Playwright 首頁 smoke test 通過（需先跑 pnpm dev）
```

- [ ] `pnpm test:unit` — health.test.ts 兩個 cases 全 pass
- [ ] `pnpm test:e2e:homepage` — 兩個 cases 全 pass

---

## Open Questions

無。此為純工具遷移，無業務邏輯變動。
