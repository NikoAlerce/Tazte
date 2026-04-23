import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingleMock = vi.fn();
const orderMock = vi.fn();
const neqMock = vi.fn(() => ({ order: orderMock }));
const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
const selectMock = vi.fn((columns) => {
  if (!columns) return { select: selectMock };
  return { eq: eqMock, neq: neqMock };
});
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: fromMock })),
}));

describe("POST /api/matches", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    maybeSingleMock.mockResolvedValue({
      data: {
        wallet_address: "tz1sourceaddressxxxxxxxxxxxxxxxxxxxxxxx",
        archetype: "The Curator",
        last_layer: "tezos",
        onboarding_answers: { intention: "A shared journey (Long-term)" },
      },
      error: null,
    });

    orderMock.mockResolvedValue({
      data: [
        {
          id: 1,
          wallet_address: "tz1targetaddressxxxxxxxxxxxxxxxxxxxxxxx",
          archetype: "The Curator",
          last_layer: "tezos",
          onboarding_answers: { intention: "A shared journey (Long-term)" },
        },
      ],
      error: null,
    });
  });

  it("rejects invalid wallet address", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: "bad" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("returns sorted compatibility matches", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: "0x1234567890123456789012345678901234567890", limit: 5 }),
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(Array.isArray(payload.matches)).toBe(true);
    expect(payload.matches[0]).toHaveProperty("score");
  });
});
