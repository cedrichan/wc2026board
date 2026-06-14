import { describe, it, expect } from "vitest";
import {
  getFifaRankingEditions,
  getFifaRankingEdition,
  lookupByFifaCode,
  lookupByTeamId,
  getMissingEditions,
} from "./loader";

describe("FIFA Rankings loader", () => {
  it("getFifaRankingEditions() returns the bundled editions", () => {
    expect(getFifaRankingEditions()).toEqual(["2026-04"]);
  });

  it("getFifaRankingEdition('2026-04') returns 48 entries", () => {
    const entries = getFifaRankingEdition("2026-04");
    expect(entries).toHaveLength(48);
  });

  it("lookupByFifaCode('ARG', '2026-04') returns rank 1", () => {
    const entry = lookupByFifaCode("ARG", "2026-04");
    expect(entry).toBeDefined();
    expect(entry?.rank).toBe(1);
  });

  it("lookupByFifaCode('NZL', '2026-04') returns rank 85", () => {
    const entry = lookupByFifaCode("NZL", "2026-04");
    expect(entry).toBeDefined();
    expect(entry?.rank).toBe(85);
  });

  it("lookup of unknown FIFA code returns undefined", () => {
    expect(lookupByFifaCode("XYZ", "2026-04")).toBeUndefined();
  });

  it("getFifaRankingEdition() returns empty array for unknown edition", () => {
    expect(getFifaRankingEdition("9999-99")).toEqual([]);
  });

  it("getMissingEditions() returns empty array (all editions complete)", () => {
    expect(getMissingEditions()).toEqual([]);
  });

  it("no duplicate fifaCodes within 2026-04", () => {
    const entries = getFifaRankingEdition("2026-04");
    const codes = entries.map((e) => e.fifaCode);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it("all entries in 2026-04 have positive integer rank and non-empty fifaCode", () => {
    const entries = getFifaRankingEdition("2026-04");
    for (const entry of entries) {
      expect(entry.fifaCode).toBeTruthy();
      expect(Number.isInteger(entry.rank)).toBe(true);
      expect(entry.rank).toBeGreaterThan(0);
    }
  });

  it("lookupByTeamId('BRA', '2026-04') returns rank 6 (teamId === fifaCode)", () => {
    const entry = lookupByTeamId("BRA", "2026-04");
    expect(entry).toBeDefined();
    expect(entry?.rank).toBe(6);
  });
});
