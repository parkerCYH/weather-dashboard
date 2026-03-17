import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockUpsertPlace = vi.fn();
const mockUpsertFavorite = vi.fn();
const mockDeleteMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
    prisma: {
        userFavorite: {
            findMany: (...args: unknown[]) => mockFindMany(...args),
            count: (...args: unknown[]) => mockCount(...args),
            upsert: (...args: unknown[]) => mockUpsertFavorite(...args),
            deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
        },
        place: {
            upsert: (...args: unknown[]) => mockUpsertPlace(...args),
        },
    },
}));

const mockGetServerAuthSession = vi.fn();

vi.mock("@/lib/getServerAuthSession", () => ({
    getServerAuthSession: () => mockGetServerAuthSession(),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

const SESSION = { user: { id: "user-123", name: "Test User", email: "test@example.com" } };

const PLACE_DB = {
    id: BigInt(1),
    osmType: "relation",
    osmId: "3349525",
    name: "Taipei, Taiwan",
    class: "boundary",
    type: "administrative",
    lat: 25.0478,
    lon: 121.5319,
    source: "Nominatim",
};

const PLACE = {
    osmType: "relation",
    osmId: "3349525",
    name: "Taipei, Taiwan",
    class: "boundary",
    type: "administrative",
    lat: 25.0478,
    lon: 121.5319,
    source: "Nominatim",
};

function makeRequest(method: string, body?: unknown): NextRequest {
    return new NextRequest(`http://localhost:3000/api/favorites`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("GET /api/favorites", () => {
    let GET: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        ({ GET } = await import("@/app/api/favorites/route"));
    });

    it("1. 未登入回 401", async () => {
        mockGetServerAuthSession.mockResolvedValue(null);
        const res = await GET(makeRequest("GET"));
        expect(res.status).toBe(401);
    });

    it("2. 已登入，無收藏回空陣列", async () => {
        mockGetServerAuthSession.mockResolvedValue(SESSION);
        mockFindMany.mockResolvedValue([]);
        const res = await GET(makeRequest("GET"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.favorites).toEqual([]);
    });

    it("3. 已登入，有收藏回傳 PlaceResult 陣列", async () => {
        mockGetServerAuthSession.mockResolvedValue(SESSION);
        mockFindMany.mockResolvedValue([
            { id: "fav-1", userId: "user-123", placeId: BigInt(1), createdAt: new Date(), place: PLACE_DB },
        ]);
        const res = await GET(makeRequest("GET"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.favorites).toHaveLength(1);
        expect(body.favorites[0].name).toBe("Taipei, Taiwan");
        expect(body.favorites[0].osmId).toBe("3349525");
    });
});

describe("POST /api/favorites", () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        ({ POST } = await import("@/app/api/favorites/route"));
    });

    it("4. 未登入回 401", async () => {
        mockGetServerAuthSession.mockResolvedValue(null);
        const res = await POST(makeRequest("POST", PLACE));
        expect(res.status).toBe(401);
    });

    it("5. 已登入，正常新增回 200，prisma.place.upsert 和 prisma.userFavorite.upsert 被呼叫", async () => {
        mockGetServerAuthSession.mockResolvedValue(SESSION);
        mockCount.mockResolvedValue(0);
        mockUpsertPlace.mockResolvedValue(PLACE_DB);
        mockUpsertFavorite.mockResolvedValue({ id: "fav-1", userId: "user-123", placeId: BigInt(1), createdAt: new Date() });
        const res = await POST(makeRequest("POST", PLACE));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.message).toBe("Added");
        expect(mockUpsertPlace).toHaveBeenCalledOnce();
        expect(mockUpsertFavorite).toHaveBeenCalledOnce();
    });

    it("6. 已達上限 10 筆回 409", async () => {
        mockGetServerAuthSession.mockResolvedValue(SESSION);
        mockCount.mockResolvedValue(10);
        const res = await POST(makeRequest("POST", PLACE));
        expect(res.status).toBe(409);
    });

    it("7. 缺少必要欄位回 400", async () => {
        mockGetServerAuthSession.mockResolvedValue(SESSION);
        mockCount.mockResolvedValue(0);
        const res = await POST(makeRequest("POST", { osmType: "relation" }));
        expect(res.status).toBe(400);
    });
});

describe("DELETE /api/favorites", () => {
    let DELETE: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();
        ({ DELETE } = await import("@/app/api/favorites/route"));
    });

    it("8. 未登入回 401", async () => {
        mockGetServerAuthSession.mockResolvedValue(null);
        const res = await DELETE(makeRequest("DELETE", { osmType: "relation", osmId: "3349525" }));
        expect(res.status).toBe(401);
    });

    it("9. 已登入，正常移除回 200，prisma.userFavorite.deleteMany 被呼叫", async () => {
        mockGetServerAuthSession.mockResolvedValue(SESSION);
        mockDeleteMany.mockResolvedValue({ count: 1 });
        const res = await DELETE(makeRequest("DELETE", { osmType: "relation", osmId: "3349525" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.message).toBe("Removed");
        expect(mockDeleteMany).toHaveBeenCalledOnce();
    });
});
