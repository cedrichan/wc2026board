import { describe, expect, it } from "vitest";
import type { GroupId } from "../domain/common";
import type { ThirdPlaceAssignment } from "../domain/ranking";
import type { ThirdPlaceRanking, ThirdPlaceRankingRow } from "../domain/standings";
import { assignThirdPlaceQualifiers } from "./third-place-assignment";

const GROUPS: GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function ranking(qualifyingGroups: GroupId[], unresolvedGroups: GroupId[] = []): ThirdPlaceRanking {
  const rows: ThirdPlaceRankingRow[] = GROUPS.map((groupId, index) => ({
    rank: index + 1,
    groupId,
    teamId: `team-${groupId}`,
    played: 3,
    goalDifference: 12 - index,
    goalsFor: 12 - index,
    conductScore: 0,
    points: 12 - index,
    qualifying: unresolvedGroups.includes(groupId) ? null : qualifyingGroups.includes(groupId),
    provisional: unresolvedGroups.includes(groupId),
  }));
  return {
    rows,
    qualificationBoundary: 8,
    boundaryResolved: unresolvedGroups.length === 0,
    diagnostics: [],
  };
}

describe("assignThirdPlaceQualifiers", () => {
  it("assigns every qualifier exactly once for a known Annex C combination", () => {
    const result = assignThirdPlaceQualifiers(ranking(["A", "B", "C", "D", "E", "F", "G", "H"]));

    expect(result.diagnostics).toEqual([]);
    expect(result.assignment?.qualifyingGroups).toBe("ABCDEFGH");
    expect(result.assignment?.slots["1A"]).toEqual({ groupId: "H", teamId: "team-H" });
    expect(result.assignment?.slots["1G"]).toEqual({ groupId: "A", teamId: "team-A" });
    expect(new Set(Object.values(result.assignment!.slots).map(({ teamId }) => teamId)).size).toBe(8);
  });

  it("selects a different Annex C row when the qualifying combination changes", () => {
    const result = assignThirdPlaceQualifiers(ranking(["A", "B", "C", "D", "E", "F", "I", "J"]));

    expect(result.assignment?.qualifyingGroups).toBe("ABCDEFIJ");
    expect(new Set(Object.values(result.assignment!.slots).map(({ groupId }) => groupId))).toEqual(
      new Set(["A", "B", "C", "D", "E", "F", "I", "J"]),
    );
  });

  it("allows provisional ordering when top-eight membership is definitive", () => {
    const input = ranking(["A", "B", "C", "D", "E", "F", "G", "H"]);
    input.rows[0].provisional = true;
    input.rows[1].provisional = true;

    expect(assignThirdPlaceQualifiers(input).assignment).toBeDefined();
  });

  it("does not assign when uncertainty spans the qualification boundary", () => {
    const result = assignThirdPlaceQualifiers(
      ranking(["A", "B", "C", "D", "E", "F", "G"], ["H", "I"]),
    );

    expect(result.assignment).toBeUndefined();
    expect(result.diagnostics[0].code).toBe("UNRESOLVED_QUALIFICATION_BOUNDARY");
  });

  it("returns explicit diagnostics for missing, duplicate, and invalid Annex C rows", () => {
    const input = ranking(["A", "B", "C", "D", "E", "F", "G", "H"]);
    const valid: ThirdPlaceAssignment = {
      qualifyingGroups: "ABCDEFGH",
      slots: { "1A": "H", "1B": "G", "1D": "B", "1E": "C", "1G": "A", "1I": "F", "1K": "D", "1L": "E" },
    };
    const invalid: ThirdPlaceAssignment = {
      ...valid,
      slots: { ...valid.slots, "1A": "A", "1G": "H" },
    };

    expect(assignThirdPlaceQualifiers(input, []).diagnostics[0].code).toBe("MISSING_ANNEX_C_ROW");
    expect(assignThirdPlaceQualifiers(input, [valid, valid]).diagnostics[0].code).toBe("NON_UNIQUE_ANNEX_C_ROW");
    expect(assignThirdPlaceQualifiers(input, [invalid]).diagnostics[0].code).toBe("INVALID_ANNEX_C_ROW");
  });
});
