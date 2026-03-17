import { test, expect, type Page, type Route } from "@playwright/test";
import { PlaceResult } from "@/lib/types/place";

const TAIPEI_PLACE: PlaceResult = {
    osmType: "relation",
    osmId: "3349525",
    name: "Taipei, Taiwan",
    class: "boundary",
    type: "administrative",
    lat: 25.0478,
    lon: 121.5319,
    source: "Nominatim",
};

const GUEST_STORAGE_KEY = "weather-guest-favorites";

const MOCK_SESSION = {
    user: { id: "test-user-123", name: "Test User", email: "test@example.com", image: null },
    expires: "2099-01-01T00:00:00.000Z",
};

/** Mock DB search to return empty — ensures "Load more results" always appears */
async function mockEmptyDBSearch(page: Page) {
    await page.route("**/api/places/search**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ source: "database", results: [] }),
        })
    );
}

/** Mock Nominatim to return a fixed Taipei result */
async function mockNominatim(page: Page) {
    await page.route("**/api/places/nominatim**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ source: "nominatim", results: [TAIPEI_PLACE] }),
        })
    );
}

/** Mock /api/auth/session to return a logged-in user */
async function mockAuthSession(page: Page) {
    await page.route("**/api/auth/session**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_SESSION),
        })
    );
}

/** Mock GET /api/favorites */
async function mockGetFavorites(page: Page, favorites: PlaceResult[] = []) {
    await page.route("**/api/favorites", (route: Route) => {
        if (route.request().method() === "GET") {
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ favorites }),
            });
        } else {
            route.continue();
        }
    });
}

/** Pre-fill guest localStorage favorites */
async function prefillGuestFavorites(page: Page, favorites: PlaceResult[]) {
    // Navigate first so we have a page context, then set localStorage
    await page.goto("/");
    const favData = JSON.stringify({ state: { favorites }, version: 0 });
    await page.evaluate(
        ({ key, data }: { key: string; data: string }) => localStorage.setItem(key, data),
        { key: GUEST_STORAGE_KEY, data: favData }
    );
}

/** Navigate to search mode and fill in query */
async function gotoSearchMode(page: Page, query: string) {
    await page.goto("/");
    await page.getByRole("button", { name: /^Search$/i }).click();
    await page.getByPlaceholder(/Search a place/i).fill(query);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe("我的收藏功能", () => {

    test("1. 訪客可點擊星星新增收藏（localStorage）", async ({ page }) => {
        await mockEmptyDBSearch(page);
        await mockNominatim(page);
        await page.route("**/api/places", (route) =>
            route.request().method() === "POST"
                ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", place: TAIPEI_PLACE }) })
                : route.continue()
        );

        await gotoSearchMode(page, "taipei");
        await expect(page.getByRole("button", { name: /Load more results/i })).toBeVisible({ timeout: 5000 });
        await page.getByRole("button", { name: /Load more results/i }).click();
        await expect(page.getByText(/Nominatim/i).first()).toBeVisible({ timeout: 8000 });

        // Star button has aria-label — use getByLabel for exact targeting
        const starBtn = page.getByLabel("Add to favorites").first();
        await expect(starBtn).toBeVisible();
        await expect(starBtn).not.toBeDisabled();

        // Click the star
        await starBtn.click();

        // Star should be filled now (aria-label changes to "Remove from favorites")
        await expect(page.getByLabel("Remove from favorites").first()).toBeVisible({ timeout: 3000 });

        // Check localStorage
        const stored = await page.evaluate((key: string) => localStorage.getItem(key), GUEST_STORAGE_KEY);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.state.favorites).toHaveLength(1);
        expect(parsed.state.favorites[0].name).toBe("Taipei, Taiwan");
    });

    test("2. 訪客收藏滿 3 筆後，未收藏地點的星星為 disabled", async ({ page }) => {
        // Set up mocks first (before any navigation)
        await mockEmptyDBSearch(page);
        await mockNominatim(page);

        // Fill 3 favorites into localStorage
        const threePlaces: PlaceResult[] = [
            { ...TAIPEI_PLACE, osmId: "1", name: "Place 1" },
            { ...TAIPEI_PLACE, osmId: "2", name: "Place 2" },
            { ...TAIPEI_PLACE, osmId: "3", name: "Place 3" },
        ];
        await page.goto("/");
        await page.evaluate(
            ({ key, data }: { key: string; data: string }) => localStorage.setItem(key, data),
            { key: GUEST_STORAGE_KEY, data: JSON.stringify({ state: { favorites: threePlaces }, version: 0 }) }
        );

        // Navigate to search without clearing the state
        await page.getByRole("button", { name: /^Search$/i }).click();
        await page.getByPlaceholder(/Search a place/i).fill("taipei");
        await expect(page.getByRole("button", { name: /Load more results/i })).toBeVisible({ timeout: 5000 });
        await page.getByRole("button", { name: /Load more results/i }).click();
        await expect(page.getByText(/Nominatim/i).first()).toBeVisible({ timeout: 8000 });

        // The Taipei result (osmId=3349525) is not in the 3 stored favorites
        // So star shows "Add to favorites" but should be disabled (limit reached)
        const starBtn = page.getByLabel("Add to favorites").first();
        await expect(starBtn).toBeVisible();
        await expect(starBtn).toBeDisabled();
    });

    test("3. 訪客 Homepage 顯示收藏清單", async ({ page }) => {
        const oneFav: PlaceResult[] = [TAIPEI_PLACE];
        await prefillGuestFavorites(page, oneFav);
        // Reload to let Zustand hydrate from localStorage
        await page.reload();
        await expect(page.getByText("Taipei, Taiwan").first()).toBeVisible({ timeout: 5000 });
        // Should have a link to weather-dashboard
        await expect(page.getByRole("link", { name: /Taipei, Taiwan/i }).first()).toBeVisible();
    });

    test("4. 訪客 Homepage 顯示收藏空狀態文字", async ({ page }) => {
        await page.goto("/");
        // Ensure localStorage is empty
        await page.evaluate((key: string) => localStorage.removeItem(key), GUEST_STORAGE_KEY);
        await page.reload();
        await expect(page.getByText(/你還沒有收藏的地點，快去搜尋吧！/)).toBeVisible({ timeout: 5000 });
    });

    test("5. 已登入可點擊星星 → POST /api/favorites 被呼叫", async ({ page }) => {
        await mockAuthSession(page);
        await mockEmptyDBSearch(page);
        await mockNominatim(page);
        await page.route("**/api/places", (route) =>
            route.request().method() === "POST"
                ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", place: TAIPEI_PLACE }) })
                : route.continue()
        );

        let postBody: unknown = null;
        // Single combined handler for /api/favorites (GET → empty list, POST → capture body)
        await page.route("**/api/favorites", (route) => {
            if (route.request().method() === "POST") {
                postBody = route.request().postDataJSON();
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ message: "Added", place: TAIPEI_PLACE }),
                });
            } else if (route.request().method() === "GET") {
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ favorites: [] }),
                });
            } else {
                route.continue();
            }
        });

        await gotoSearchMode(page, "taipei");
        await expect(page.getByRole("button", { name: /Load more results/i })).toBeVisible({ timeout: 5000 });
        await page.getByRole("button", { name: /Load more results/i }).click();
        await expect(page.getByText(/Nominatim/i).first()).toBeVisible({ timeout: 8000 });

        // For logged-in user, star should show "Add to favorites"
        const starBtn = page.getByLabel("Add to favorites").first();
        await expect(starBtn).toBeVisible({ timeout: 3000 });
        await starBtn.click();

        // Wait for the POST to be captured
        await page.waitForTimeout(800);
        expect(postBody).not.toBeNull();
        expect((postBody as PlaceResult).name).toBe("Taipei, Taiwan");
    });

    test("6. 點擊已收藏的星星 → DELETE /api/favorites 被呼叫，星星變空心", async ({ page }) => {
        await mockAuthSession(page);
        await mockEmptyDBSearch(page);
        await mockNominatim(page);

        let deleteCalled = false;
        let favList = [TAIPEI_PLACE];
        // Single combined handler: GET returns current favList; DELETE empties it
        await page.route("**/api/favorites", (route) => {
            if (route.request().method() === "DELETE") {
                deleteCalled = true;
                favList = [];
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ message: "Removed" }),
                });
            } else if (route.request().method() === "GET") {
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ favorites: favList }),
                });
            } else {
                route.continue();
            }
        });

        await gotoSearchMode(page, "taipei");
        await expect(page.getByRole("button", { name: /Load more results/i })).toBeVisible({ timeout: 5000 });
        await page.getByRole("button", { name: /Load more results/i }).click();
        await expect(page.getByText(/Nominatim/i).first()).toBeVisible({ timeout: 8000 });

        // Taipei is already favorited → star shows "Remove from favorites"
        const starBtn = page.getByLabel("Remove from favorites").first();
        await expect(starBtn).toBeVisible({ timeout: 3000 });
        await starBtn.click();

        await page.waitForTimeout(800);
        expect(deleteCalled).toBe(true);
        // After optimistic update + invalidation, star should now show "Add to favorites"
        await expect(page.getByLabel("Add to favorites").first()).toBeVisible({ timeout: 5000 });
    });

    test("7. 已登入 Homepage 顯示 Redis 收藏清單", async ({ page }) => {
        await mockAuthSession(page);
        await mockGetFavorites(page, [TAIPEI_PLACE]);
        await page.goto("/");
        await expect(page.getByText("Taipei, Taiwan").first()).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole("link", { name: /Taipei, Taiwan/i }).first()).toBeVisible();
    });

    test("8. PlaceCard Bookmark 按鈕呼叫收藏 API", async ({ page }) => {
        await mockAuthSession(page);
        // Mock weather API so page loads successfully
        await page.route("**/api/weather**", (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    current_weather: { is_day: 1, temperature: 25, time: 0, weathercode: 0, winddirection: 0, windspeed: 10 },
                    daily: { apparent_temperature_max: [26], apparent_temperature_min: [20], sunrise: [0], sunset: [0], temperature_2m_max: [26], temperature_2m_min: [20], time: [0], uv_index_clear_sky_max: [5], uv_index_max: [5], weathercode: [0] },
                    daily_units: { apparent_temperature_max: "°C", apparent_temperature_min: "°C", sunrise: "iso8601", sunset: "iso8601", temperature_2m_max: "°C", temperature_2m_min: "°C", time: "unixtime", uv_index_clear_sky_max: "", uv_index_max: "", weathercode: "" },
                    hourly: { apparent_temperature: Array(24).fill(25), dewpoint_2m: Array(24).fill(15), is_day: Array(24).fill(1), precipitation: Array(24).fill(0), precipitation_probability: Array(24).fill(0), rain: Array(24).fill(0), relativehumidity_2m: Array(24).fill(60), showers: Array(24).fill(0), snow_depth: Array(24).fill(0), snowfall: Array(24).fill(0), temperature_2m: Array(24).fill(25), time: Array(24).fill(0), uv_index: Array(24).fill(3), uv_index_clear_sky: Array(24).fill(4) },
                    hourly_units: { apparent_temperature: "°C", dewpoint_2m: "°C", is_day: "", precipitation: "mm", precipitation_probability: "%", rain: "mm", relativehumidity_2m: "%", showers: "mm", snow_depth: "m", snowfall: "cm", temperature_2m: "°C", time: "unixtime", uv_index: "", uv_index_clear_sky: "" },
                    elevation: 10,
                    generationtime_ms: 1,
                    latitude: 25.0478,
                    longitude: 121.5319,
                    timezone: "Asia/Taipei",
                    timezone_abbreviation: "CST",
                    utc_offset_seconds: 28800,
                }),
            })
        );

        let postBody: unknown = null;
        await page.route("**/api/favorites", (route) => {
            if (route.request().method() === "POST") {
                postBody = route.request().postDataJSON();
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ message: "Added", place: TAIPEI_PLACE }),
                });
            } else if (route.request().method() === "GET") {
                route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({ favorites: [] }),
                });
            } else {
                route.continue();
            }
        });

        await page.goto(`/weather-dashboard?lat=25.0478&lon=121.5319&city=Taipei`);
        await expect(page.getByRole("button", { name: /Save/i }).first()).toBeVisible({ timeout: 8000 });
        await page.getByRole("button", { name: /Save/i }).first().click();

        await page.waitForTimeout(800);
        expect(postBody).not.toBeNull();
    });
});
