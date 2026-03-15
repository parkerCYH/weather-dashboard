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
