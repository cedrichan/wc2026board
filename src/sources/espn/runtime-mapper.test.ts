import observedScoreboard from "./__fixtures__/scoreboard-observed-states-20260614.json";
import rangeScoreboard from "./__fixtures__/scoreboard-range-20260611-20260719.json";
import { describe, expect, it } from "vitest";
import { parseEspnScoreboard } from "./schema";
import { mapEspnScoreboardToNormalizationInput } from "./runtime-mapper";

describe("mapEspnScoreboardToNormalizationInput", () => {
  it("maps observed group-stage events onto local match numbers", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(observedScoreboard),
    );
    const openingMatch = result.matches.find((match) => match.id === "760415");

    expect(openingMatch).toMatchObject({
      id: "760415",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-11T19:00Z",
      venue: "Estadio Banorte",
      city: "Mexico City",
    });
    expect(openingMatch?.competitors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          homeAway: "home",
          team: expect.objectContaining({
            id: "203",
            fifaCode: "MEX",
            name: "Mexico",
            shortName: "MEX",
            group: "A",
          }),
        }),
      ]),
    );
  });

  it("extracts disciplinary events from completed matches and marks coverage COMPLETE", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(observedScoreboard),
    );
    const openingMatch = result.matches.find((match) => match.id === "760415");

    expect(openingMatch?.conductCoverage).toBe("COMPLETE");
    expect(openingMatch?.disciplinaryEvents).toEqual([
      { teamId: "467", playerId: "256691", cardType: "YELLOW", minute: 16 },
      { teamId: "203", playerId: "303577", cardType: "YELLOW", minute: 22 },
      { teamId: "467", playerId: "228595", cardType: "RED_DIRECT", minute: 49 },
      { teamId: "467", playerId: "266125", cardType: "YELLOW", minute: 73 },
      { teamId: "467", playerId: "157046", cardType: "RED_DIRECT", minute: 83 },
      { teamId: "203", playerId: "224323", cardType: "RED_DIRECT", minute: 90 },
    ]);
  });

  it("marks conduct UNKNOWN for incomplete (non-finished) matches", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(rangeScoreboard),
    );
    // 760495 = Congo DR at England (M80), STATUS_SCHEDULED in the fixture
    const scheduledMatch = result.matches.find((match) => match.id === "760495");

    expect(scheduledMatch?.conductCoverage).toBe("UNKNOWN");
    expect(scheduledMatch?.disciplinaryEvents).toEqual([]);
  });

  it("maps knockout placeholders and the final onto local match numbers", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(rangeScoreboard),
    );
    const roundOf32 = result.matches.find((match) => match.id === "760487");
    const final = result.matches[result.matches.length - 1];

    // Event 760487 is Group C winner vs Group F runner-up = FIFA M76.
    // It kicks off before M74 and M75, so ESPN's fixture places it at array
    // position 74 — the old eventIndex+1 logic would have returned 74 here.
    expect(roundOf32).toMatchObject({
      id: "760487",
      matchNumber: 76,
      round: "ROUND_OF_32",
      kickoffUtc: "2026-06-29T17:00Z",
      venue: "NRG Stadium",
    });
    expect(final).toMatchObject({
      matchNumber: 104,
      round: "FINAL",
    });
  });

  it("resolves R32 match numbers when ESPN has replaced placeholder home codes with real team abbreviations", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(rangeScoreboard),
    );

    // These three matches had their group already settled when the schedule
    // fixture was captured, so ESPN shows the real team code (GER/MEX/USA)
    // instead of a placeholder (1E/1A/1D). The fallback path matches them by
    // the unique group set in the away third-place slot's display name.
    const m74 = result.matches.find((m) => m.id === "760489");
    expect(m74).toMatchObject({ matchNumber: 74, round: "ROUND_OF_32" });

    const m79 = result.matches.find((m) => m.id === "760491");
    expect(m79).toMatchObject({ matchNumber: 79, round: "ROUND_OF_32" });

    const m81 = result.matches.find((m) => m.id === "760494");
    expect(m81).toMatchObject({ matchNumber: 81, round: "ROUND_OF_32" });
  });

  it("resolves R16 match numbers when kickoff order differs from FIFA match-number order (M89/M90)", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(rangeScoreboard),
    );

    // M89 (winner of M74 vs winner of M77) kicks off at Lincoln Financial
    // Field *after* M90 (winner of M73 vs winner of M75) kicks off at NRG
    // Stadium, both on 2026-07-04. The fixture lists NRG first, so the old
    // eventIndex+1 logic would have swapped them.
    const m89 = result.matches.find((m) => m.venue === "Lincoln Financial Field" && m.round === "ROUND_OF_16");
    expect(m89).toMatchObject({ matchNumber: 89, round: "ROUND_OF_16" });

    const m90 = result.matches.find((m) => m.venue === "NRG Stadium" && m.round === "ROUND_OF_16");
    expect(m90).toMatchObject({ matchNumber: 90, round: "ROUND_OF_16" });
  });

  it("maps ESPN shootoutScore to penaltyScore for completed penalty-shootout matches (M74 GER-PAR)", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(rangeScoreboard),
    );
    // M74: Germany vs Paraguay, 1-1 after extra time, Paraguay won 4-3 on penalties.
    // ESPN returns competitors[].shootoutScore (integer) for STATUS_FINAL_PEN.
    const m74 = result.matches.find((m) => m.id === "760489");
    expect(m74?.competitors?.find((c) => c.homeAway === "home")?.penaltyScore).toBe(3); // GER
    expect(m74?.competitors?.find((c) => c.homeAway === "away")?.penaltyScore).toBe(4); // PAR
  });
});
