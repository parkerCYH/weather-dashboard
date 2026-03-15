import { test, expect } from "@playwright/test";

test.describe("訪客模式 + Rate Limiting", () => {
    test("訪客可直接訪問首頁，不被 redirect 到 /login", async ({ page }) => {
        await page.goto("/");
        await expect(page).not.toHaveURL(/\/login/);
        // CardTitle renders as <div>, not a heading element
        await expect(page.getByText("Weather Dashboard").first()).toBeVisible();
    });

    test("首頁對訪客顯示 guest 提示訊息", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByText(/browsing as a guest/i).first()).toBeVisible();
    });

    test("登入頁顯示「Continue as Guest」按鈕", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByText(/Continue as Guest/i).first()).toBeVisible();
    });

    test("Continue as Guest 按鈕跳轉至首頁", async ({ page }) => {
        await page.goto("/login");
        await page.getByText(/Continue as Guest/i).first().click();
        await expect(page).toHaveURL("/");
    });

    test("Header 對訪客顯示 Guest badge 和 Sign in 連結", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("header").getByText("Guest", { exact: true })).toBeVisible();
        // Header Sign in link — use the one inside <header>
        await expect(page.locator("header").getByRole("link", { name: /Sign in/i })).toBeVisible();
    });

    test("Rate limit: 第 51 次請求回傳 429", async ({ request }) => {
        const url = "/api/weather?latitude=25.0478&longitude=121.5319";
        let lastStatus = 200;

        for (let i = 0; i < 51; i++) {
            const res = await request.get(url);
            lastStatus = res.status();
            if (lastStatus === 429) break;
        }

        expect(lastStatus).toBe(429);
    });

    test("Rate limit: /api/auth/session 不受 rate limit 影響", async ({ request }) => {
        for (let i = 0; i < 10; i++) {
            const res = await request.get("/api/auth/session");
            expect(res.status()).not.toBe(429);
        }
    });
});
