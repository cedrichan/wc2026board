/**
 * Annex C third-place bracket assignment loader.
 *
 * The FIFA WC2026 Competition Regulations Annex C defines exactly one slot
 * assignment for each of the C(12,8) = 495 possible combinations of 8
 * qualifying groups from Groups A–L.
 *
 * This module provides a pure lookup function. It never infers or guesses
 * assignments — if the combination is not found in the table, it returns
 * undefined.
 *
 * Status: The JSON data file must be populated from the official FIFA WC2026
 * Competition Regulations Annex C before this module can serve all 495
 * combinations. See annex-c-provenance.md for sourcing instructions.
 */

import type { ThirdPlaceAssignment } from "../domain/ranking";
import rawData from "./third-place-assignments.json";

// Cast the imported JSON to the domain type array
const assignments: ThirdPlaceAssignment[] = rawData as ThirdPlaceAssignment[];

// Build an index for O(1) lookups
const index = new Map<string, ThirdPlaceAssignment>(
  assignments.map((row) => [row.qualifyingGroups, row]),
);

/**
 * Find the Annex C assignment for a given set of 8 qualifying groups.
 *
 * @param qualifyingGroups - Array of exactly 8 group letters (A–L).
 *   Order does not matter; the function sorts them before lookup.
 * @returns The matching ThirdPlaceAssignment, or undefined if not found.
 *   Returns undefined when the input has the wrong number of groups, contains
 *   invalid letters, or the combination is not present in the data.
 */
export function findThirdPlaceAssignment(
  qualifyingGroups: string[],
): ThirdPlaceAssignment | undefined {
  if (qualifyingGroups.length !== 8) {
    return undefined;
  }
  const key = [...qualifyingGroups].sort().join("");
  return index.get(key);
}

/**
 * The full list of all loaded Annex C assignments.
 * Exposed for structural validation in tests.
 */
export { assignments as thirdPlaceAssignments };
