import { describe, expect, it, vi } from "vitest";
import { analyzeCollectorArchetype, getUserCreations, getUserNFTs } from "@/lib/tzkt";

describe("tzkt helpers", () => {
  it("returns empty arrays when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(getUserNFTs("tz1abc")).resolves.toEqual([]);
    await expect(getUserCreations("tz1abc")).resolves.toEqual([]);
  });

  it("builds curator archetype from owned NFTs", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => new Array(8).fill({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
    );

    const result = await analyzeCollectorArchetype("tz1abc");
    expect(result.primaryArchetype).toBe("The Curator");
    expect(result.isArtist).toBe(false);
  });
});
