import { describe, expect, it } from "vitest";
import { computeCompatibility } from "@/lib/matching";

describe("computeCompatibility", () => {
  const baseProfile = {
    archetype: "The Curator",
    last_layer: "tezos",
    onboarding_answers: {
      intention: "A shared journey (Long-term)",
      philosophy: "A delicate balance of both",
      resilience: "Keep creating/collecting quietly",
      connection: "Collecting their work",
    },
  };

  it("returns high score for strongly aligned profiles", () => {
    const result = computeCompatibility(baseProfile, { ...baseProfile });
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  it("returns bounded score when profile data is sparse", () => {
    const result = computeCompatibility(baseProfile, {
      archetype: null,
      last_layer: null,
      onboarding_answers: {},
    });
    expect(result.score).toBeGreaterThanOrEqual(30);
    expect(result.score).toBeLessThanOrEqual(99);
  });
});
