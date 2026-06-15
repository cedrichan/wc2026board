import { describe, expect, it } from "vitest";
import type { Match, PartialTeam } from "../../domain";
import { deduplicateMatches, deduplicateTeams } from "./deduplicate";

describe("ESPN identity deduplication", () => {
  it("chooses the newest match, enriches missing fields, and reports invariant conflicts", () => {
    const older: Match = {
      id: "760415",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-11T19:00:00.000Z",
      venue: "Estadio Banorte",
      status: "FIRST_HALF",
      updatedAt: "2026-06-11T20:00:00.000Z",
    };
    const newest: Match = {
      ...older,
      matchNumber: 2,
      venue: undefined,
      status: "FINISHED",
      updatedAt: "2026-06-11T21:00:00.000Z",
    };

    const result = deduplicateMatches([newest, older]);

    expect(result.values).toHaveLength(1);
    expect(result.values[0]).toMatchObject({
      matchNumber: 2,
      status: "FINISHED",
      venue: "Estadio Banorte",
    });
    expect(result.diagnostics[0]).toContain("invariant conflict for matchNumber");
  });

  it("deduplicates teams deterministically and diagnoses invariant conflicts", () => {
    const teams: PartialTeam[] = [
      { id: "203", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "A" },
      { id: "203", fifaCode: "MEX", name: "México", shortName: "MEX", group: "B", flagUrl: "https://a.espncdn.com/mex.png" },
    ];

    const forward = deduplicateTeams(teams);
    const reverse = deduplicateTeams([...teams].reverse());

    expect(forward).toEqual(reverse);
    expect(forward.values[0].flagUrl).toBe("https://a.espncdn.com/mex.png");
    expect(forward.diagnostics[0]).toContain("invariant conflict for group");
  });
});
