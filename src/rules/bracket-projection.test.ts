import { describe, expect, it } from "vitest";
import type {
  BracketMatchDefinition,
  GroupId,
  GroupStandings,
  Match,
  StandingRow,
  ThirdPlaceRanking,
} from "../domain";
import { buildBracketProjection } from "./bracket-projection";

const GROUPS: GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function row(teamId: string, position: number, provisional = false): StandingRow {
  return {
    teamId,
    position,
    played: 3,
    wins: 1,
    draws: 1,
    losses: 1,
    goalsFor: 3,
    goalsAgainst: 3,
    goalDifference: 0,
    points: 4,
    qualification: provisional ? "UNRESOLVED" : position < 3 ? "DIRECT" : "THIRD_PLACE_QUALIFIER",
    provisional,
  };
}

function standings(winnerA = "winner-A"): GroupStandings[] {
  return GROUPS.map((groupId) => ({
    groupId,
    complete: true,
    rows: [
      row(groupId === "A" ? winnerA : `winner-${groupId}`, 1),
      row(`runner-${groupId}`, 2),
      row(`third-${groupId}`, 3),
      row(`fourth-${groupId}`, 4),
    ],
  }));
}

function ranking(
  qualifyingGroups: GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H"],
  boundaryResolved = true,
): ThirdPlaceRanking {
  return {
    rows: GROUPS.map((groupId, index) => ({
      rank: index + 1,
      groupId,
      teamId: `third-${groupId}`,
      played: 3,
      goalDifference: 12 - index,
      goalsFor: 12 - index,
      conductScore: 0,
      points: 12 - index,
      qualifying: boundaryResolved ? qualifyingGroups.includes(groupId) : index < 7 ? true : index < 9 ? null : false,
      provisional: !boundaryResolved && index >= 7 && index < 9,
    })),
    qualificationBoundary: 8,
    boundaryResolved,
    diagnostics: [],
  };
}

function groupMatches(groups: readonly GroupId[] = GROUPS): Match[] {
  return groups.flatMap((group, groupIndex) =>
    Array.from({ length: 6 }, (_, index) => ({
      id: `${group}-${index}`,
      matchNumber: groupIndex * 6 + index + 1,
      round: "GROUP_STAGE" as const,
      group,
      kickoffUtc: "2026-06-14T18:00:00Z",
      status: "FINISHED" as const,
    })),
  );
}

function projectedMatch(
  projection: ReturnType<typeof buildBracketProjection>,
  matchNumber: number,
) {
  return projection.find((match) => match.matchNumber === matchNumber)!;
}

describe("buildBracketProjection", () => {
  it("updates a direct Round-of-32 projection when live standings change", () => {
    const before = buildBracketProjection(standings(), ranking(), []);
    const after = buildBracketProjection(standings("live-goal-winner-A"), ranking(), []);

    expect(projectedMatch(before, 79).homeParticipant).toMatchObject({
      state: "PROJECTED",
      teamId: "winner-A",
      qualificationSource: "Projected winner of Group A",
    });
    expect(projectedMatch(after, 79).homeParticipant.teamId).toBe("live-goal-winner-A");
  });

  it("confirms direct placements only after the entire group is final", () => {
    const incomplete = buildBracketProjection(standings(), ranking(), groupMatches(["A"]).slice(0, 5));
    const complete = buildBracketProjection(standings(), ranking(), groupMatches(["A"]));

    expect(projectedMatch(incomplete, 79).homeParticipant.state).toBe("PROJECTED");
    expect(projectedMatch(complete, 79).homeParticipant).toMatchObject({
      state: "CONFIRMED",
      teamId: "winner-A",
    });
  });

  it("preserves a direct source placeholder when its placement is provisional", () => {
    const input = standings();
    input[0].rows[0] = row("provisional-winner-A", 1, true);

    expect(projectedMatch(buildBracketProjection(input, ranking(), []), 79).homeParticipant).toEqual({
      state: "UNRESOLVED",
      teamId: "provisional-winner-A",
      provisional: true,
      unresolvedReason: "The winner of Group A is provisional",
    });
  });

  it("does not select an individual team from a tied direct placement", () => {
    const input = standings();
    input[0].rows[1] = row("also-winner-A", 1, true);

    expect(projectedMatch(buildBracketProjection(input, ranking(), []), 79).homeParticipant).toMatchObject({
      state: "UNRESOLVED",
      label: "1A",
    });
  });

  it("updates all Annex C-dependent slots when qualifying groups change", () => {
    const first = buildBracketProjection(standings(), ranking(), []);
    const second = buildBracketProjection(
      standings(),
      ranking(["A", "B", "C", "D", "E", "F", "I", "J"]),
      [],
    );
    const thirdPlaceTeams = (projection: ReturnType<typeof buildBracketProjection>) =>
      projection
        .filter((match) => match.round === "ROUND_OF_32" && match.awayParticipant.qualificationSource?.includes("third-place"))
        .map((match) => match.awayParticipant.teamId);

    expect(thirdPlaceTeams(first)).toHaveLength(8);
    expect(new Set(thirdPlaceTeams(first))).toEqual(
      new Set(["third-A", "third-B", "third-C", "third-D", "third-E", "third-F", "third-G", "third-H"]),
    );
    expect(new Set(thirdPlaceTeams(second))).toEqual(
      new Set(["third-A", "third-B", "third-C", "third-D", "third-E", "third-F", "third-I", "third-J"]),
    );
  });

  it("marks every Annex C-dependent slot unresolved when the boundary is unresolved", () => {
    const projection = buildBracketProjection(standings(), ranking([], false), []);
    const annexSlots = projection
      .filter((match) => match.round === "ROUND_OF_32" && match.awayParticipant.label?.startsWith("3"))
      .map((match) => match.awayParticipant);

    expect(annexSlots).toHaveLength(8);
    expect(annexSlots.every((slot) => slot.state === "UNRESOLVED" && slot.teamId == null)).toBe(true);
    expect(annexSlots[0].unresolvedReason).toContain("definitive top-eight membership");
  });

  it("confirms third-place participants only when all groups are complete", () => {
    const projected = buildBracketProjection(standings(), ranking(), groupMatches(GROUPS.slice(0, 11)));
    const confirmed = buildBracketProjection(standings(), ranking(), groupMatches());

    expect(projectedMatch(projected, 74).awayParticipant.state).toBe("PROJECTED");
    expect(projectedMatch(confirmed, 74).awayParticipant.state).toBe("CONFIRMED");
  });

  it("retains a known third-place team when its qualification line is provisional", () => {
    const input = ranking();
    input.rows[0].provisional = true;

    expect(projectedMatch(buildBracketProjection(standings(), input, []), 82).awayParticipant).toEqual({
      state: "UNRESOLVED",
      teamId: "third-A",
      provisional: true,
      unresolvedReason: "The third-place qualifier from Group A is provisional",
    });
  });

  it("uses only finished knockout results for later-round participants", () => {
    const topology: BracketMatchDefinition[] = [{
      matchNumber: 89,
      round: "ROUND_OF_16",
      homeSource: { type: "MATCH_WINNER", matchNumber: 74 },
      awaySource: { type: "MATCH_WINNER", matchNumber: 75 },
    }];
    const knockout = (matchNumber: number, status: Match["status"]): Match => ({
      id: `m${matchNumber}`,
      matchNumber,
      round: "ROUND_OF_32",
      kickoffUtc: "2026-07-01T18:00:00Z",
      status,
      homeTeamId: `home-${matchNumber}`,
      awayTeamId: `away-${matchNumber}`,
      winnerTeamId: `home-${matchNumber}`,
    });

    const result = buildBracketProjection(
      standings(),
      ranking(),
      [knockout(74, "SECOND_HALF"), knockout(75, "FINISHED")],
      topology,
    )[0];

    expect(result.homeParticipant).toEqual({ state: "PLACEHOLDER", label: "Winner M74" });
    expect(result.awayParticipant).toEqual({ state: "CONFIRMED", teamId: "home-75" });
  });
});
