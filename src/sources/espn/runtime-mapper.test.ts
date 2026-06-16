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
    const scheduledMatch = result.matches.find((match) => match.id === "760487");

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
});
