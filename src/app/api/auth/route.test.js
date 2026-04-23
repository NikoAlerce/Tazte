import { beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();
const upsertMock = vi.fn(() => ({ select: selectMock }));
const fromMock = vi.fn(() => ({ upsert: upsertMock }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: fromMock })),
}));

describe("POST /api/auth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    selectMock.mockResolvedValue({ data: [{ id: 1, wallet_address: "tz1abc" }], error: null });
  });

  it("rejects invalid payload", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: "invalid-address" }),
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBeTruthy();
  });

  it("upserts validated profile", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body: JSON.stringify({
        address: "0x1234567890123456789012345678901234567890",
        archetype: "The Curator",
        layer: "etherlink",
      }),
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(fromMock).toHaveBeenCalledWith("profiles");
  });
});
