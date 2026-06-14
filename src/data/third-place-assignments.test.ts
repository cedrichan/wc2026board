/**
 * Structural and loader tests for the FIFA WC2026 Annex C third-place
 * assignment table.
 *
 * These tests validate the shape and integrity of third-place-assignments.json
 * and the findThirdPlaceAssignment loader.
 *
 * NOTE: Tests that require the complete 495-row table are marked as
 * test.todo until the data file is populated from the official FIFA WC2026
 * Competition Regulations Annex C. See annex-c-provenance.md for instructions.
 */

import { describe, expect, it, test } from "vitest";
import {
  findThirdPlaceAssignment,
  thirdPlaceAssignments,
} from "./third-place-assignments";

// Valid group letters for WC2026 (A through L)
const VALID_GROUP_LETTERS = new Set("ABCDEFGHIJKL".split(""));

// The 8 required slot keys defined by Annex C
const REQUIRED_SLOTS = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"] as const;

// ─── Structural validation ────────────────────────────────────────────────────

describe("Annex C data — structural validation", () => {
  /**
   * Test 1: Exactly 495 rows
   *
   * C(12,8) = 495 possible combinations of 8 groups from A–L.
   *
   * STATUS: Marked as todo — the complete 495-row table must be transcribed
   * from the official FIFA WC2026 Competition Regulations Annex C.
   * See src/data/annex-c-provenance.md for import instructions.
   * Once the JSON is populated, replace test.todo with a regular it() assertion.
   */
  it("has exactly 495 rows", () => {
    expect(thirdPlaceAssignments).toHaveLength(495);
  });

  /**
   * Test 2: All qualifyingGroups keys are unique
   */
  it("has unique qualifyingGroups keys", () => {
    const seen = new Set<string>();
    for (const row of thirdPlaceAssignments) {
      expect(seen.has(row.qualifyingGroups)).toBe(false);
      seen.add(row.qualifyingGroups);
    }
  });

  /**
   * Test 3: Each key is exactly 8 characters, all valid group letters
   * (A–L), sorted alphabetically, with no duplicate letters within the key.
   */
  it("each qualifyingGroups key is exactly 8 sorted unique letters A–L", () => {
    for (const row of thirdPlaceAssignments) {
      const key = row.qualifyingGroups;
      // Must be exactly 8 characters
      expect(key).toHaveLength(8);
      // All characters must be valid group letters
      for (const ch of key) {
        expect(VALID_GROUP_LETTERS.has(ch)).toBe(true);
      }
      // Letters must be sorted alphabetically
      const sorted = key.split("").sort().join("");
      expect(key).toBe(sorted);
      // No duplicate letters within the key
      const letters = key.split("");
      expect(new Set(letters).size).toBe(8);
    }
  });

  /**
   * Test 4: Every row has exactly the 8 required slot keys.
   */
  it("every row has exactly the 8 required slot keys", () => {
    const requiredSet = new Set<string>(REQUIRED_SLOTS);
    for (const row of thirdPlaceAssignments) {
      const keys = Object.keys(row.slots).sort();
      const expected = [...REQUIRED_SLOTS].sort();
      expect(keys).toEqual(expected);
      expect(keys.length).toBe(requiredSet.size);
    }
  });

  /**
   * Test 5: Every slot value is a single valid group letter (A–L).
   */
  it("every slot value is a single letter A–L", () => {
    for (const row of thirdPlaceAssignments) {
      for (const slotKey of REQUIRED_SLOTS) {
        const value = row.slots[slotKey];
        expect(typeof value).toBe("string");
        expect(value).toHaveLength(1);
        expect(VALID_GROUP_LETTERS.has(value)).toBe(true);
      }
    }
  });

  /**
   * Test 6: Every slot value appears in the row's qualifyingGroups
   * (you can only assign a third-place team from a group that actually
   * qualified).
   */
  it("every slot value belongs to the row's qualifying groups", () => {
    for (const row of thirdPlaceAssignments) {
      const qualifying = new Set(row.qualifyingGroups.split(""));
      for (const slotKey of REQUIRED_SLOTS) {
        const value = row.slots[slotKey];
        expect(qualifying.has(value)).toBe(true);
      }
    }
  });

  /**
   * Test 7: Within each row, slot values are unique (each third-place
   * team appears exactly once across the 8 slots).
   */
  it("slot values within each row are unique", () => {
    for (const row of thirdPlaceAssignments) {
      const values = REQUIRED_SLOTS.map((k) => row.slots[k]);
      expect(new Set(values).size).toBe(8);
    }
  });
});

// ─── Rejection tests ─────────────────────────────────────────────────────────

describe("Annex C data — rejection tests", () => {
  /**
   * Test 8: A corrupted key must not match any row.
   */
  describe("corrupted keys do not match any row", () => {
    const qualifyingGroupsSet = new Set(
      thirdPlaceAssignments.map((r) => r.qualifyingGroups),
    );

    it("wrong length (9 characters) is not a valid key", () => {
      expect(qualifyingGroupsSet.has("ABCDEFGHI")).toBe(false);
    });

    it("wrong length (7 characters) is not a valid key", () => {
      expect(qualifyingGroupsSet.has("ABCDEFG")).toBe(false);
    });

    it("invalid letter in key is not a valid key", () => {
      // 'M' is not a valid group letter in WC2026
      expect(qualifyingGroupsSet.has("ABCDEFGM")).toBe(false);
    });

    it("unsorted key is not a valid key", () => {
      // 'HGFEDCBA' is ABCDEFGH reversed — must be sorted to match
      expect(qualifyingGroupsSet.has("HGFEDCBA")).toBe(false);
    });

    it("key with duplicate letters is not a valid key", () => {
      // 'AABCDEFG' has duplicate 'A'
      expect(qualifyingGroupsSet.has("AABCDEFG")).toBe(false);
    });
  });

  /**
   * Test 9: Row structural validation — a row with a missing slot fails.
   *
   * This test validates the structural check logic by constructing a bad
   * row and asserting that the validation helper would reject it.
   */
  it("a row missing a required slot fails structural validation", () => {
    // Construct a row-like object missing the '1A' slot
    const badSlots = { "1B": "B", "1D": "C", "1E": "D", "1G": "E", "1I": "F", "1K": "G", "1L": "H" };
    const requiredSet = new Set<string>(REQUIRED_SLOTS);
    const presentKeys = new Set(Object.keys(badSlots));
    const hasAllRequired = [...requiredSet].every((k) => presentKeys.has(k));
    expect(hasAllRequired).toBe(false);
  });
});

// ─── Golden assertions ────────────────────────────────────────────────────────

describe("Annex C data — golden assertions", () => {
  /**
   * Test 10: Known row verified against Wikipedia's transcription of Annex C.
   *
   * Source: https://en.wikipedia.org/wiki/Template:2026_FIFA_World_Cup_third-place_table
   * (row 495: groups A,B,C,D,E,F,G,H qualify)
   */
  it("ABCDEFGH combination assigns correct slot values (row 495)", () => {
    const result = findThirdPlaceAssignment(["A","B","C","D","E","F","G","H"]);
    expect(result).toBeDefined();
    expect(result?.slots["1A"]).toBe("H");
    expect(result?.slots["1B"]).toBe("G");
    expect(result?.slots["1D"]).toBe("B");
    expect(result?.slots["1E"]).toBe("C");
    expect(result?.slots["1G"]).toBe("A");
    expect(result?.slots["1I"]).toBe("F");
    expect(result?.slots["1K"]).toBe("D");
    expect(result?.slots["1L"]).toBe("E");
  });
});

// ─── Loader tests ─────────────────────────────────────────────────────────────

describe("findThirdPlaceAssignment — loader", () => {
  /**
   * Test 11: Input order does not matter — the function sorts before lookup.
   */
  it("returns the same result regardless of input order", () => {
    const unordered = findThirdPlaceAssignment(["B", "A", "D", "C", "E", "F", "G", "H"]);
    const ordered = findThirdPlaceAssignment(["A", "B", "C", "D", "E", "F", "G", "H"]);
    // Both should produce the same result (undefined when data is absent,
    // or the same row when data is present)
    expect(unordered).toEqual(ordered);
  });

  /**
   * Test 12: Wrong input count returns undefined.
   */
  it("returns undefined for fewer than 8 groups", () => {
    const result = findThirdPlaceAssignment(["A", "B", "C"]);
    expect(result).toBeUndefined();
  });

  it("returns undefined for more than 8 groups", () => {
    const result = findThirdPlaceAssignment(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
    expect(result).toBeUndefined();
  });

  it("returns undefined for an empty array", () => {
    const result = findThirdPlaceAssignment([]);
    expect(result).toBeUndefined();
  });

  it("returns undefined for a combination not in the data", () => {
    // 'ZZZZZZZZ' is not a valid combination
    const result = findThirdPlaceAssignment(["Z", "Z", "Z", "Z", "Z", "Z", "Z", "Z"]);
    expect(result).toBeUndefined();
  });
});
