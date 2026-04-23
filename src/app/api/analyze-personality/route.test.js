import { beforeEach, describe, expect, it, vi } from "vitest";

describe("POST /api/analyze-personality", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    process.env.PERSONALITY_ANALYZER_MODE = "heuristic";
    delete process.env.PERSONALITY_ANALYZER_URL;
  });

  it("returns 400 when walletAddress is missing", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/analyze-personality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it("returns heuristic profile by default", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/analyze-personality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: "tz1abc",
        onboardingAnswers: { value: "The concept behind the piece" },
      }),
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.source).toBe("heuristic");
  });
});
