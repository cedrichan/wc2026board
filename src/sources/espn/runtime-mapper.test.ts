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

  it("maps knockout placeholders and the final onto local match numbers", () => {
    const result = mapEspnScoreboardToNormalizationInput(
      parseEspnScoreboard(rangeScoreboard),
    );
    const roundOf32 = result.matches.find((match) => match.id === "760487");
    const final = result.matches[result.matches.length - 1];

    expect(roundOf32).toMatchObject({
      id: "760487",
      matchNumber: 74,
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
