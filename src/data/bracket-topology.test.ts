/**
 * B006: Validate bracket topology integrity.
 *
 * These tests assert structural correctness of the static BRACKET_TOPOLOGY
 * configuration. They do not depend on React or any UI code.
 */

import { describe, it, expect } from "vitest";
import { BRACKET_TOPOLOGY } from "./bracket-topology";
import type { BracketMatchDefinition, SlotSource } from "../domain/bracket";
import type { GroupId, TournamentRound } from "../domain/common";

// ── Helpers ───────────────────────────────────────────────────────────────

const VALID_GROUPS = new Set<GroupId>(["A","B","C","D","E","F","G","H","I","J","K","L"]);

const ROUND_ORDER: Record<Exclude<TournamentRound, "GROUP_STAGE">, number> = {
  ROUND_OF_32:  1,
  ROUND_OF_16:  2,
  QUARTER_FINAL: 3,
  SEMI_FINAL:   4,
  THIRD_PLACE:  5,
  FINAL:        5, // same numeric level as THIRD_PLACE; both are terminal
};

function roundOf(matchNumber: number): Exclude<TournamentRound, "GROUP_STAGE"> {
  const m = BRACKET_TOPOLOGY.find((d) => d.matchNumber === matchNumber);
  if (!m) throw new Error(`Match M${matchNumber} not found in topology`);
  return m.round;
}

// ── 1. Coverage ───────────────────────────────────────────────────────────

describe("coverage", () => {
  it("has exactly 32 match definitions", () => {
    expect(BRACKET_TOPOLOGY).toHaveLength(32);
  });

  it("match numbers form the complete set {73, 74, ..., 104}", () => {
    const numbers = BRACKET_TOPOLOGY.map((d) => d.matchNumber).sort((a, b) => a - b);
    const expected = Array.from({ length: 32 }, (_, i) => 73 + i);
    expect(numbers).toEqual(expected);
  });

  it("has no duplicate match numbers", () => {
    const numbers = BRACKET_TOPOLOGY.map((d) => d.matchNumber);
    const unique = new Set(numbers);
    expect(unique.size).toBe(numbers.length);
  });
});

// ── 2. Round counts ───────────────────────────────────────────────────────

describe("round counts", () => {
  const countRound = (r: BracketMatchDefinition["round"]) =>
    BRACKET_TOPOLOGY.filter((d) => d.round === r).length;

  it("has exactly 16 ROUND_OF_32 matches", () => {
    expect(countRound("ROUND_OF_32")).toBe(16);
  });

  it("has exactly 8 ROUND_OF_16 matches", () => {
    expect(countRound("ROUND_OF_16")).toBe(8);
  });

  it("has exactly 4 QUARTER_FINAL matches", () => {
    expect(countRound("QUARTER_FINAL")).toBe(4);
  });

  it("has exactly 2 SEMI_FINAL matches", () => {
    expect(countRound("SEMI_FINAL")).toBe(2);
  });

  it("has exactly 1 THIRD_PLACE match", () => {
    expect(countRound("THIRD_PLACE")).toBe(1);
  });

  it("has exactly 1 FINAL match", () => {
    expect(countRound("FINAL")).toBe(1);
  });
});

// ── 3. Winner feeds ───────────────────────────────────────────────────────

describe("winner feeds", () => {
  const matchNumbers = new Set(BRACKET_TOPOLOGY.map((d) => d.matchNumber));

  it("every winnerFeedsMatch target exists in the topology", () => {
    for (const def of BRACKET_TOPOLOGY) {
      if (def.winnerFeedsMatch !== undefined) {
        expect(matchNumbers.has(def.winnerFeedsMatch), `M${def.matchNumber} feeds M${def.winnerFeedsMatch} which does not exist`).toBe(true);
      }
    }
  });

  it("no match feeds itself", () => {
    for (const def of BRACKET_TOPOLOGY) {
      if (def.winnerFeedsMatch !== undefined) {
        expect(def.winnerFeedsMatch, `M${def.matchNumber} self-feeds`).not.toBe(def.matchNumber);
      }
    }
  });

  it("no match feeds into an earlier or same round", () => {
    for (const def of BRACKET_TOPOLOGY) {
      if (def.winnerFeedsMatch !== undefined) {
        const sourceLevel = ROUND_ORDER[def.round];
        const targetLevel = ROUND_ORDER[roundOf(def.winnerFeedsMatch)];
        expect(targetLevel, `M${def.matchNumber} (${def.round}) feeds M${def.winnerFeedsMatch} (${roundOf(def.winnerFeedsMatch)}) which is not a later round`).toBeGreaterThan(sourceLevel);
      }
    }
  });

  it("no match feeds into the third-place match via winnerFeedsMatch", () => {
    const thirdPlaceMatch = BRACKET_TOPOLOGY.find((d) => d.round === "THIRD_PLACE")!;
    for (const def of BRACKET_TOPOLOGY) {
      if (def.winnerFeedsMatch !== undefined) {
        expect(def.winnerFeedsMatch, `M${def.matchNumber} winner-feeds the third-place match`).not.toBe(thirdPlaceMatch.matchNumber);
      }
    }
  });

  it("the Final (M104) has no winnerFeedsMatch", () => {
    const finalMatch = BRACKET_TOPOLOGY.find((d) => d.round === "FINAL")!;
    expect(finalMatch.matchNumber).toBe(104);
    expect(finalMatch.winnerFeedsMatch).toBeUndefined();
  });

  it("the third-place match (M103) has no winnerFeedsMatch", () => {
    const thirdPlace = BRACKET_TOPOLOGY.find((d) => d.round === "THIRD_PLACE")!;
    expect(thirdPlace.matchNumber).toBe(103);
    expect(thirdPlace.winnerFeedsMatch).toBeUndefined();
  });

  it("each later-match side (HOME/AWAY) is occupied by exactly one feeder", () => {
    // Build a map: targetMatchNumber -> Set of "HOME" | "AWAY" that feed into it
    const sideOccupancy = new Map<number, Set<string>>();
    for (const def of BRACKET_TOPOLOGY) {
      if (def.winnerFeedsMatch !== undefined && def.winnerFeedsSide !== undefined) {
        const key = def.winnerFeedsMatch;
        if (!sideOccupancy.has(key)) sideOccupancy.set(key, new Set());
        const sides = sideOccupancy.get(key)!;
        expect(sides.has(def.winnerFeedsSide), `M${def.winnerFeedsMatch} ${def.winnerFeedsSide} side is fed by more than one match (duplicate: M${def.matchNumber})`).toBe(false);
        sides.add(def.winnerFeedsSide);
      }
    }

    // Every match that is a feed target should have exactly HOME and AWAY occupied
    for (const [targetMatchNum, sides] of sideOccupancy.entries()) {
      expect(sides.has("HOME"), `M${targetMatchNum} HOME side has no feeder`).toBe(true);
      expect(sides.has("AWAY"), `M${targetMatchNum} AWAY side has no feeder`).toBe(true);
    }
  });

  it("every non-terminal match has a winnerFeedsMatch and winnerFeedsSide", () => {
    for (const def of BRACKET_TOPOLOGY) {
      if (def.round !== "FINAL" && def.round !== "THIRD_PLACE") {
        expect(def.winnerFeedsMatch, `M${def.matchNumber} (${def.round}) is missing winnerFeedsMatch`).toBeDefined();
        expect(def.winnerFeedsSide, `M${def.matchNumber} (${def.round}) is missing winnerFeedsSide`).toBeDefined();
      }
    }
  });
});

// ── 4. Source slot validity ───────────────────────────────────────────────

describe("source slot validity", () => {
  const allSources = BRACKET_TOPOLOGY.flatMap((d) => [
    { source: d.homeSource, def: d },
    { source: d.awaySource, def: d },
  ]);

  it("GROUP_WINNER and GROUP_RUNNER_UP use valid group IDs (A–L)", () => {
    for (const { source, def } of allSources) {
      if (source.type === "GROUP_WINNER" || source.type === "GROUP_RUNNER_UP") {
        expect(VALID_GROUPS.has(source.group), `M${def.matchNumber} uses invalid group "${source.group}"`).toBe(true);
      }
    }
  });

  it("THIRD_PLACE slot sources appear only in ROUND_OF_32 matches", () => {
    for (const { source, def } of allSources) {
      if (source.type === "THIRD_PLACE") {
        expect(def.round, `M${def.matchNumber} has a THIRD_PLACE source but is not ROUND_OF_32`).toBe("ROUND_OF_32");
      }
    }
  });

  it("MATCH_WINNER sources reference earlier matches only", () => {
    const matchByNumber = new Map(BRACKET_TOPOLOGY.map((d) => [d.matchNumber, d]));
    for (const { source, def } of allSources) {
      if (source.type === "MATCH_WINNER") {
        const referencedMatch = matchByNumber.get(source.matchNumber);
        expect(referencedMatch, `M${def.matchNumber} references MATCH_WINNER of non-existent M${source.matchNumber}`).toBeDefined();
        const sourceLevel = ROUND_ORDER[referencedMatch!.round];
        const currentLevel = ROUND_ORDER[def.round];
        expect(sourceLevel, `M${def.matchNumber} references MATCH_WINNER of M${source.matchNumber} which is not in an earlier round`).toBeLessThan(currentLevel);
      }
    }
  });

  it("MATCH_LOSER sources appear only in the THIRD_PLACE round match", () => {
    for (const { source, def } of allSources) {
      if (source.type === "MATCH_LOSER") {
        expect(def.round, `M${def.matchNumber} has a MATCH_LOSER source but is not THIRD_PLACE`).toBe("THIRD_PLACE");
      }
    }
  });

  it("the third-place match (M103) uses exactly two MATCH_LOSER sources referencing M101 and M102", () => {
    const m103 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 103)!;
    expect(m103).toBeDefined();

    expect(m103.homeSource.type).toBe("MATCH_LOSER");
    expect(m103.awaySource.type).toBe("MATCH_LOSER");

    const loserSources = [m103.homeSource, m103.awaySource].filter(
      (s): s is Extract<SlotSource, { type: "MATCH_LOSER" }> => s.type === "MATCH_LOSER"
    );
    const referencedMatches = new Set(loserSources.map((s) => s.matchNumber));
    expect(referencedMatches).toEqual(new Set([101, 102]));
  });

  it("GROUP_WINNER sources appear only in ROUND_OF_32 matches", () => {
    for (const { source, def } of allSources) {
      if (source.type === "GROUP_WINNER") {
        expect(def.round, `M${def.matchNumber} has GROUP_WINNER source outside R32`).toBe("ROUND_OF_32");
      }
    }
  });

  it("GROUP_RUNNER_UP sources appear only in ROUND_OF_32 matches", () => {
    for (const { source, def } of allSources) {
      if (source.type === "GROUP_RUNNER_UP") {
        expect(def.round, `M${def.matchNumber} has GROUP_RUNNER_UP source outside R32`).toBe("ROUND_OF_32");
      }
    }
  });

  it("there are exactly 8 THIRD_PLACE slot sources (one per Annex C slot)", () => {
    const thirdPlaceSources = allSources.filter((s) => s.source.type === "THIRD_PLACE");
    expect(thirdPlaceSources).toHaveLength(8);
  });

  it("every ROUND_OF_32 match has at most one THIRD_PLACE source slot", () => {
    for (const def of BRACKET_TOPOLOGY.filter((d) => d.round === "ROUND_OF_32")) {
      const thirdPlaceCount =
        (def.homeSource.type === "THIRD_PLACE" ? 1 : 0) +
        (def.awaySource.type === "THIRD_PLACE" ? 1 : 0);
      expect(thirdPlaceCount, `M${def.matchNumber} has more than one THIRD_PLACE source`).toBeLessThanOrEqual(1);
    }
  });
});

// ── 5. Golden assertions ──────────────────────────────────────────────────

/**
 * Golden assertions verifying specific known pairings from the official
 * FIFA WC2026 bracket structure.
 *
 * Source: FIFA World Cup 2026™ Competition Regulations, Annex A
 * (bracket draw structure, group-position pairings).
 * See also: https://www.sportsreference.com/soccer/international/worldcup/2026/bracket/
 */
describe("golden assertions (official bracket pairings)", () => {
  it("M73 home source is Group A winner and away source is a third-place team", () => {
    const m73 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 73)!;
    expect(m73.homeSource).toEqual({ type: "GROUP_WINNER", group: "A" });
    expect(m73.awaySource.type).toBe("THIRD_PLACE");
  });

  it("M89 is the Round-of-16 match fed by winners of M73 and M74", () => {
    const m73 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 73)!;
    const m74 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 74)!;
    expect(m73.winnerFeedsMatch).toBe(89);
    expect(m73.winnerFeedsSide).toBe("HOME");
    expect(m74.winnerFeedsMatch).toBe(89);
    expect(m74.winnerFeedsSide).toBe("AWAY");
  });

  it("M97 is the quarter-final fed by winners of M89 and M90", () => {
    const m89 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 89)!;
    const m90 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 90)!;
    expect(m89.winnerFeedsMatch).toBe(97);
    expect(m90.winnerFeedsMatch).toBe(97);
  });

  it("M101 semi-final feeds M104 (Final) as HOME and M103 (3rd place) as loser source", () => {
    const m101 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 101)!;
    expect(m101.winnerFeedsMatch).toBe(104);
    expect(m101.winnerFeedsSide).toBe("HOME");

    const m103 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 103)!;
    expect(m103.homeSource).toEqual({ type: "MATCH_LOSER", matchNumber: 101 });
  });

  it("M102 semi-final feeds M104 (Final) as AWAY and M103 (3rd place) as loser source", () => {
    const m102 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 102)!;
    expect(m102.winnerFeedsMatch).toBe(104);
    expect(m102.winnerFeedsSide).toBe("AWAY");

    const m103 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 103)!;
    expect(m103.awaySource).toEqual({ type: "MATCH_LOSER", matchNumber: 102 });
  });

  it("M104 Final home source is winner of M101 and away source is winner of M102", () => {
    const m104 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 104)!;
    expect(m104.homeSource).toEqual({ type: "MATCH_WINNER", matchNumber: 101 });
    expect(m104.awaySource).toEqual({ type: "MATCH_WINNER", matchNumber: 102 });
  });

  it("upper-half QF (M97) feeds SF M101, lower-half QF (M99) feeds SF M102", () => {
    const m97 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 97)!;
    const m98 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 98)!;
    const m99 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 99)!;
    const m100 = BRACKET_TOPOLOGY.find((d) => d.matchNumber === 100)!;
    expect(m97.winnerFeedsMatch).toBe(101);
    expect(m98.winnerFeedsMatch).toBe(101);
    expect(m99.winnerFeedsMatch).toBe(102);
    expect(m100.winnerFeedsMatch).toBe(102);
  });
});
