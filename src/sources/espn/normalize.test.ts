import { describe, expect, it } from "vitest";
import { normalizeEspnScoreboards, type EspnMatchInput } from "./normalize";

function match(overrides: Partial<EspnMatchInput> = {}): EspnMatchInput {
  return {
    id: "760415",
    matchNumber: 1,
    round: "GROUP_STAGE",
    group: "Group A",
    kickoffUtc: "2026-06-11T19:00:00Z",
    updatedAt: "2026-06-11T21:00:00Z",
    venue: "<b>Estadio Banorte</b>",
    city: "Mexico City",
    status: {
      clock: 5400,
      displayClock: "90'+8'",
      period: 2,
      type: { name: "STATUS_FULL_TIME", state: "post", completed: true },
    },
    competitors: [
      {
        homeAway: "home",
        score: "2",
        winner: true,
        team: {
          id: "203",
          fifaCode: "MEX",
          name: "Mexico",
          shortName: "MEX",
          group: "A",
          imageUrl: "https://a.espncdn.com/i/teamlogos/countries/500/mex.png",
        },
      },
      {
        homeAway: "away",
        score: "0",
        winner: false,
        team: {
          id: "467",
          fifaCode: "RSA",
          name: "South Africa",
          shortName: "RSA",
          group: "A",
          imageUrl: "https://evil.test/rsa.png",
        },
      },
    ],
    ...overrides,
  };
}

describe("normalizeEspnScoreboards", () => {
  it("uses ESPN IDs, preserves zero, sanitizes optional data, and chooses the newest source timestamp", () => {
    const result = normalizeEspnScoreboards([
      { sourceUpdatedAt: "2026-06-11T20:00:00Z", matches: [match()] },
      { sourceUpdatedAt: "2026-06-11T22:00:00Z", matches: [] },
    ]);

    expect(result.sourceUpdatedAt).toBe("2026-06-11T22:00:00.000Z");
    expect(result.teams.map((team) => team.id)).toEqual(["203", "467"]);
    expect(result.teams[1].flagUrl).toBeUndefined();
    expect(result.matches[0]).toMatchObject({
      id: "760415",
      venue: "Estadio Banorte",
      normalTime: { home: 2, away: 0 },
      winnerTeamId: "203",
      disciplinaryCoverage: "UNAVAILABLE",
    });
  });

  it("never synthesizes missing IDs or winners for live leaders", () => {
    const result = normalizeEspnScoreboards([{
      matches: [
        match({ id: null }),
        match({
          id: "live",
          status: { name: "STATUS_IN_PROGRESS", period: 2 },
          competitors: match().competitors?.map((competitor) => ({ ...competitor, winner: competitor.homeAway === "home" })),
        }),
      ],
    }]);

    expect(result.matches.map(({ id }) => id)).toEqual(["live"]);
    expect(result.matches[0].winnerTeamId).toBeUndefined();
    expect(result.diagnostics.missingFields).toContain("matches[].id");
  });

  it("retains ESPN-ID-backed partial teams and diagnoses missing optional identity", () => {
    const partial = match({
      competitors: [{
        homeAway: "home",
        team: { id: "203", name: "Mexico" },
      }],
    });

    const result = normalizeEspnScoreboards([{ matches: [partial] }]);

    expect(result.teams).toEqual([{ id: "203", name: "Mexico" }]);
    expect(result.diagnostics.missingFields).toEqual(expect.arrayContaining([
      "teams[203].fifaCode",
      "teams[203].group",
      "teams[203].shortName",
    ]));
  });

  it("keeps penalties separate and exposes conduct only when completeness is proven", () => {
    const result = normalizeEspnScoreboards([{
      matches: [
        match({
          status: { name: "STATUS_FINAL_PEN", completed: true },
          conductCoverage: "COMPLETE",
          disciplinaryEvents: [{ teamId: "203", playerName: "<b>Player</b>", cardType: "YELLOW", minute: 17 }],
          competitors: match().competitors?.map((competitor) => ({
            ...competitor,
            normalTimeScore: 1,
            extraTimeScore: 0,
            penaltyScore: competitor.homeAway === "home" ? 5 : 4,
          })),
        }),
      ],
    }]);

    expect(result.matches[0]).toMatchObject({
      normalTime: { home: 1, away: 1 },
      extraTime: { home: 0, away: 0 },
      penalties: { home: 5, away: 4 },
      disciplinaryCoverage: "COMPLETE",
      disciplinaryEvents: [{ playerName: "Player", cardType: "YELLOW" }],
    });
  });

  it("diagnoses unknown statuses and duplicate invariant conflicts", () => {
    const result = normalizeEspnScoreboards([{
      matches: [
        match({ status: { name: "STATUS_NEW" } }),
        match({ matchNumber: 2, status: { name: "STATUS_NEW" } }),
      ],
    }]);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].status).toBe("UNKNOWN");
    expect(result.diagnostics.warnings.some((warning) => warning.includes("invariant conflict for matchNumber"))).toBe(true);
    expect(result.diagnostics.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "INVARIANT_CONFLICT" }),
      expect.objectContaining({ code: "UNKNOWN_STATUS", matchId: "760415" }),
    ]));
  });
});
