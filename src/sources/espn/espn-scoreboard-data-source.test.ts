import { describe, expect, it, vi } from "vitest";
import type { Match, TournamentSnapshot } from "../../domain";
import {
  addFixtureCoverageDiagnostics,
  EspnScoreboardDataSource,
} from "./espn-scoreboard-data-source";

function makeMatch(matchNumber: number): Match {
  return {
    id: `match-${matchNumber}`,
    matchNumber,
    round: matchNumber <= 72 ? "GROUP_STAGE" : "ROUND_OF_32",
    kickoffUtc: "2026-06-11T00:00:00Z",
    status: "SCHEDULED",
  };
}

function makeSnapshot(matches: Match[]): TournamentSnapshot {
  return {
    generatedAt: "2026-06-14T00:00:00Z",
    schemaVersion: "1",
    tournamentId: "fifa.world.2026",
    stale: false,
    teams: [],
    matches,
    diagnostics: {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [],
      missingFields: [],
    },
  };
}

describe("EspnScoreboardDataSource", () => {
  it("normalizes validated payloads and reports incomplete coverage", async () => {
    const payload = { events: [] };
    const mapToNormalizationInput = vi.fn(() => ({
      matches: [{
        id: "match-1",
        matchNumber: 1,
        round: "GROUP_STAGE",
        group: "A",
        kickoffUtc: "2026-06-11T00:00:00Z",
        status: { name: "STATUS_SCHEDULED" },
        competitors: [],
        conductCoverage: "UNKNOWN" as const,
      }],
    }));
    const source = new EspnScoreboardDataSource({
      fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      ),
      mapToNormalizationInput,
      now: () => new Date("2026-06-14T00:00:00Z"),
    });

    const snapshot = await source.getSnapshot();

    expect(mapToNormalizationInput).toHaveBeenCalledWith(payload);
    expect(snapshot.generatedAt).toBe("2026-06-14T00:00:00.000Z");
    expect(snapshot.matches).toHaveLength(1);
    const coverageWarning = snapshot.diagnostics.warnings.find((warning) =>
      warning.startsWith("Incomplete ESPN fixture coverage:"),
    );
    expect(coverageWarning).toContain("received 1 of 104 matches");
    expect(coverageWarning).toContain("M2");
    expect(coverageWarning).toContain("M104");
  });
});

describe("addFixtureCoverageDiagnostics", () => {
  it("returns a complete snapshot unchanged", () => {
    const snapshot = makeSnapshot(
      Array.from({ length: 104 }, (_, index) => makeMatch(index + 1)),
    );

    expect(addFixtureCoverageDiagnostics(snapshot)).toBe(snapshot);
  });

  it("counts unique match numbers and preserves existing diagnostics", () => {
    const snapshot = makeSnapshot([
      makeMatch(1),
      makeMatch(1),
      makeMatch(104),
      makeMatch(999),
    ]);
    snapshot.diagnostics.warnings.push("existing warning");

    const result = addFixtureCoverageDiagnostics(snapshot);

    expect(result.diagnostics.warnings[0]).toBe("existing warning");
    expect(result.diagnostics.warnings[1]).toContain(
      "received 2 of 104 matches",
    );
  });
});
