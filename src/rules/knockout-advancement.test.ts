import { describe, expect, it } from "vitest";
import type { BracketMatchDefinition, Match } from "../domain";
import { resolveKnockoutAdvancement } from "./knockout-advancement";

const topology: readonly BracketMatchDefinition[] = [
  {
    matchNumber: 101,
    round: "SEMI_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 97 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 98 },
    winnerFeedsMatch: 104,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 102,
    round: "SEMI_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 99 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 100 },
    winnerFeedsMatch: 104,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 103,
    round: "THIRD_PLACE",
    homeSource: { type: "MATCH_LOSER", matchNumber: 101 },
    awaySource: { type: "MATCH_LOSER", matchNumber: 102 },
  },
  {
    matchNumber: 104,
    round: "FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 101 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 102 },
  },
];

function match(
  matchNumber: number,
  status: Match["status"],
  winnerTeamId?: string,
): Match {
  return {
    id: `m${matchNumber}`,
    matchNumber,
    round: matchNumber < 101 ? "QUARTER_FINAL" : "SEMI_FINAL",
    kickoffUtc: "2026-07-14T18:00:00Z",
    status,
    homeTeamId: `home-${matchNumber}`,
    awayTeamId: `away-${matchNumber}`,
    normalTime: { home: 3, away: 0 },
    winnerTeamId,
  };
}

function participant(
  slots: ReturnType<typeof resolveKnockoutAdvancement>,
  matchNumber: number,
  side: "HOME" | "AWAY",
) {
  return slots.find((slot) => slot.matchNumber === matchNumber && slot.side === side)
    ?.participant;
}

describe("resolveKnockoutAdvancement", () => {
  it.each([
    ["FINISHED", 97],
    ["FINISHED_AFTER_EXTRA_TIME", 98],
    ["FINISHED_AFTER_PENALTIES", 99],
  ] as const)("advances an explicit winner from %s", (status, sourceMatchNumber) => {
    const source = match(sourceMatchNumber, status, `away-${sourceMatchNumber}`);
    const slots = resolveKnockoutAdvancement([source], topology);

    expect(participant(slots, sourceMatchNumber === 99 ? 102 : 101, sourceMatchNumber === 98 ? "AWAY" : "HOME")).toEqual({
      state: "CONFIRMED",
      teamId: `away-${sourceMatchNumber}`,
    });
  });

  it("does not advance a live leader", () => {
    const slots = resolveKnockoutAdvancement(
      [match(97, "SECOND_HALF", "home-97")],
      topology,
    );

    expect(participant(slots, 101, "HOME")).toEqual({
      state: "PLACEHOLDER",
      label: "Winner M97",
    });
  });

  it.each([
    ["missing", undefined],
    ["not a participant", "other-team"],
  ])("preserves the placeholder when winnerTeamId is %s", (_, winnerTeamId) => {
    const slots = resolveKnockoutAdvancement(
      [match(97, "FINISHED", winnerTeamId)],
      topology,
    );

    expect(participant(slots, 101, "HOME")).toEqual({
      state: "PLACEHOLDER",
      label: "Winner M97",
    });
  });

  it("populates the final and third-place match from finished semi-finals", () => {
    const slots = resolveKnockoutAdvancement(
      [
        match(101, "FINISHED_AFTER_EXTRA_TIME", "home-101"),
        match(102, "FINISHED_AFTER_PENALTIES", "away-102"),
      ],
      topology,
    );

    expect(participant(slots, 104, "HOME")).toEqual({
      state: "CONFIRMED",
      teamId: "home-101",
    });
    expect(participant(slots, 104, "AWAY")).toEqual({
      state: "CONFIRMED",
      teamId: "away-102",
    });
    expect(participant(slots, 103, "HOME")).toEqual({
      state: "CONFIRMED",
      teamId: "away-101",
    });
    expect(participant(slots, 103, "AWAY")).toEqual({
      state: "CONFIRMED",
      teamId: "home-102",
    });
  });

  it("keeps loser placeholders until a reliable semi-final winner exists", () => {
    const slots = resolveKnockoutAdvancement(
      [match(101, "FINISHED")],
      topology,
    );

    expect(participant(slots, 103, "HOME")).toEqual({
      state: "PLACEHOLDER",
      label: "Loser M101",
    });
  });
});
