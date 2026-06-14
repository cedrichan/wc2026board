import { thirdPlaceAssignments } from "../data/third-place-assignments";
import type { GroupId } from "../domain/common";
import type {
  ResolvedThirdPlaceAssignment,
  ThirdPlaceAssignment,
  ThirdPlaceAssignmentDiagnostic,
  ThirdPlaceAssignmentResult,
  ThirdPlaceWinnerSlot,
} from "../domain/ranking";
import type { ThirdPlaceRanking } from "../domain/standings";

const GROUP_IDS = new Set<GroupId>(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);
const WINNER_SLOTS: ThirdPlaceWinnerSlot[] = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];

export function assignThirdPlaceQualifiers(
  ranking: ThirdPlaceRanking,
  annexRows: readonly ThirdPlaceAssignment[] = thirdPlaceAssignments,
): ThirdPlaceAssignmentResult {
  const diagnostics: ThirdPlaceAssignmentDiagnostic[] = [];

  if (!ranking.boundaryResolved || ranking.rows.some((row) => row.qualifying === null)) {
    diagnostics.push({
      code: "UNRESOLVED_QUALIFICATION_BOUNDARY",
      message: "Annex C assignment requires definitive top-eight membership",
    });
    return { diagnostics };
  }

  const qualifiers = ranking.rows.filter((row) => row.qualifying);
  if (qualifiers.length !== 8) {
    diagnostics.push({
      code: "INVALID_QUALIFIER_COUNT",
      message: `Expected 8 qualifying third-place teams, received ${qualifiers.length}`,
    });
  }
  if (new Set(qualifiers.map((row) => row.groupId)).size !== qualifiers.length) {
    diagnostics.push({
      code: "DUPLICATE_QUALIFYING_GROUP",
      message: "Qualifying third-place teams contain a duplicate group",
    });
  }
  if (new Set(qualifiers.map((row) => row.teamId)).size !== qualifiers.length) {
    diagnostics.push({
      code: "DUPLICATE_QUALIFYING_TEAM",
      message: "Qualifying third-place teams contain a duplicate team",
    });
  }
  if (qualifiers.some((row) => !GROUP_IDS.has(row.groupId))) {
    diagnostics.push({
      code: "INVALID_QUALIFYING_GROUP",
      message: "Qualifying third-place teams contain an invalid group",
    });
  }
  if (diagnostics.length > 0) {
    return { diagnostics };
  }

  const qualifyingGroups = qualifiers.map((row) => row.groupId).sort().join("");
  const matches = annexRows.filter((row) => row.qualifyingGroups === qualifyingGroups);
  if (matches.length === 0) {
    return {
      diagnostics: [{
        code: "MISSING_ANNEX_C_ROW",
        message: `No Annex C row exists for ${qualifyingGroups}`,
      }],
    };
  }
  if (matches.length > 1) {
    return {
      diagnostics: [{
        code: "NON_UNIQUE_ANNEX_C_ROW",
        message: `Multiple Annex C rows exist for ${qualifyingGroups}`,
      }],
    };
  }

  const annexRow = matches[0];
  const qualifierByGroup = new Map(qualifiers.map((row) => [row.groupId, row]));
  const assignedGroups = WINNER_SLOTS.map((slot) => annexRow.slots[slot]);
  const validRow =
    WINNER_SLOTS.every((slot) => {
      const groupId = annexRow.slots[slot] as GroupId;
      return GROUP_IDS.has(groupId) && qualifierByGroup.has(groupId) && slot.slice(1) !== groupId;
    }) &&
    new Set(assignedGroups).size === WINNER_SLOTS.length;

  if (!validRow) {
    return {
      diagnostics: [{
        code: "INVALID_ANNEX_C_ROW",
        message: `Annex C row for ${qualifyingGroups} does not assign each qualifying group exactly once`,
      }],
    };
  }

  const slots = Object.fromEntries(
    WINNER_SLOTS.map((slot) => {
      const groupId = annexRow.slots[slot] as GroupId;
      return [slot, { groupId, teamId: qualifierByGroup.get(groupId)!.teamId }];
    }),
  ) as ResolvedThirdPlaceAssignment["slots"];

  return {
    assignment: { qualifyingGroups, slots },
    diagnostics,
  };
}
