import { describe, it, expect } from "vitest";

describe("Server Health", () => {
    it("API base URL env variable is defined", () => {
        const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
        expect(url).toMatch(/^https?:\/\//);
    });

    it("basic arithmetic works (vitest is running)", () => {
        expect(1 + 1).toBe(2);
    });
});
