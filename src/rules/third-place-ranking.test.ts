import { describe, expect, it } from "vitest";
import type { GroupId } from "../domain/common";
import type { GroupStandings, StandingRow } from "../domain/standings";
import type { Team } from "../domain/team";
import { rankThirdPlaceTeams } from "./third-place-ranking";

const GROUPS: GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const FIFA_CODES = ["ARG", "ESP", "FRA", "ENG", "POR", "BRA", "MAR", "NED", "BEL", "GER", "CRO", "COL"];

function standing(
  groupId: GroupId,
  overrides: Partial<StandingRow> = {},
): GroupStandings {
  const third: StandingRow = {
    teamId: `team-${groupId}`,
    position: 3,
    played: 3,
    wins: 1,
    draws: 1,
    losses: 1,
    goalsFor: 3,
    goalsAgainst: 3,
    goalDifference: 0,
    points: 4,
    conductScore: 0,
    qualification: "THIRD_PLACE_QUALIFIER",
    provisional: false,
    ...overrides,
  };
  return {
    groupId,
    complete: true,
    rows: [
      { ...third, teamId: `winner-${groupId}`, position: 1, points: 9, qualification: "DIRECT" },
      { ...third, teamId: `runner-${groupId}`, position: 2, points: 6, qualification: "DIRECT" },
      third,
      { ...third, teamId: `fourth-${groupId}`, position: 4, points: 0, qualification: "OUTSIDE" },
    ],
  };
}

function teams(): Team[] {
  return GROUPS.map((group, index) => ({
    id: `team-${group}`,
    fifaCode: FIFA_CODES[index],
    name: `Team ${group}`,
    shortName: group,
    group,
  }));
}

describe("rankThirdPlaceTeams", () => {
  it("selects one third-place team per group and marks a clear top eight", () => {
    const standings = GROUPS.map((group, index) =>
      standing(group, { points: 15 - index, goalDifference: 12 - index }),
    );

    const result = rankThirdPlaceTeams(standings, teams());

    expect(result.rows).toHaveLength(12);
    expect(result.rows.slice(0, 8).every((row) => row.qualifying === true)).toBe(true);
    expect(result.rows.slice(8).every((row) => row.qualifying === false)).toBe(true);
    expect(result.boundaryResolved).toBe(true);
    expect(new Set(result.rows.map((row) => row.groupId)).size).toBe(12);
  });

  it("resolves a tie spanning positions eight and nine by conduct", () => {
    const standings = GROUPS.map((group, index) =>
      standing(group, {
        points: index < 7 ? 10 - index : index < 9 ? 3 : 2,
        goalDifference: index < 7 ? 10 - index : 0,
        goalsFor: index < 7 ? 10 - index : 2,
        conductScore: group === "H" ? -1 : group === "I" ? -3 : 0,
      }),
    );

    const result = rankThirdPlaceTeams(standings, teams());

    expect(result.rows[7]).toMatchObject({
      groupId: "H",
      qualifying: true,
      tiebreakerUsed: "conduct score",
    });
    expect(result.rows[8]).toMatchObject({
      groupId: "I",
      qualifying: false,
      tiebreakerUsed: "conduct score",
    });
    expect(result.boundaryResolved).toBe(true);
  });

  it("marks every member of an unresolved tie spanning positions eight and nine", () => {
    const standings = GROUPS.map((group, index) =>
      standing(group, {
        points: index < 7 ? 10 - index : index < 9 ? 3 : 2,
        goalDifference: index < 7 ? 10 - index : 0,
        goalsFor: index < 7 ? 10 - index : 2,
        conductScore: index < 7 || index >= 9 ? 0 : undefined,
      }),
    );

    const result = rankThirdPlaceTeams(standings, teams());

    expect(result.rows.filter((row) => row.qualifying === null).map((row) => row.groupId)).toEqual([
      "H",
      "I",
    ]);
    expect(result.rows.slice(0, 7).every((row) => row.qualifying === true)).toBe(true);
    expect(result.rows.slice(9).every((row) => row.qualifying === false)).toBe(true);
    expect(result.boundaryResolved).toBe(false);
    expect(result.diagnostics).toContainEqual({
      teamIds: ["team-H", "team-I"],
      criterion: "conduct score",
      affectsQualification: true,
    });
  });

  it("allows unresolved ordering wholly within the top eight", () => {
    const standings = GROUPS.map((group, index) =>
      standing(group, {
        points: index < 2 ? 10 : 8 - index,
        goalDifference: index < 2 ? 3 : 8 - index,
        goalsFor: index < 2 ? 4 : 8 - index,
        conductScore: index < 2 ? undefined : 0,
      }),
    );

    const result = rankThirdPlaceTeams(standings, teams());

    expect(result.rows.slice(0, 2).every((row) => row.qualifying === true && row.provisional)).toBe(true);
    expect(result.boundaryResolved).toBe(true);
    expect(result.diagnostics[0].affectsQualification).toBe(false);
  });
});
