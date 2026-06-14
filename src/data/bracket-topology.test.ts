/**
 * B006: Validate bracket topology integrity.
 *
 * These tests assert structural correctness of the static BRACKET_TOPOLOGY
 * configuration. They do not depend on React or any UI code.
 */

import { describe, it, expect } from "vitest";
import { BRACKET_TOPOLOGY, BRACKET_TOPOLOGY_SOURCE } from "./bracket-topology";
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
  it("records the authoritative regulations edition and articles", () => {
    expect(BRACKET_TOPOLOGY_SOURCE).toEqual({
      document: "Regulations for the FIFA World Cup 26",
      edition: "May 2026",
      articles: ["12.6", "12.7", "12.8", "12.9", "12.10", "12.11"],
      url: "https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf",
    });
  });

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

  it("winner feed metadata matches every MATCH_WINNER source", () => {
    for (const target of BRACKET_TOPOLOGY) {
      const sources = [
        { source: target.homeSource, side: "HOME" },
        { source: target.awaySource, side: "AWAY" },
      ] as const;

      for (const { source, side } of sources) {
        if (source.type !== "MATCH_WINNER") continue;

        const feeder = BRACKET_TOPOLOGY.find((def) => def.matchNumber === source.matchNumber);
        expect(feeder, `M${target.matchNumber} references missing M${source.matchNumber}`).toBeDefined();
        expect(feeder!.winnerFeedsMatch, `M${source.matchNumber} does not feed M${target.matchNumber}`).toBe(target.matchNumber);
        expect(feeder!.winnerFeedsSide, `M${source.matchNumber} feeds the wrong side of M${target.matchNumber}`).toBe(side);
      }
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
 * Golden assertions for every home/away source in article 12.6-12.11 of the
 * May 2026 Regulations for the FIFA World Cup 26.
 */
describe("golden assertions (official article 12 bracket)", () => {
  const expectedSources: Readonly<Record<number, readonly [SlotSource, SlotSource]>> = {
    73: [{ type: "GROUP_RUNNER_UP", group: "A" }, { type: "GROUP_RUNNER_UP", group: "B" }],
    74: [{ type: "GROUP_WINNER", group: "E" }, { type: "THIRD_PLACE", groups: "A/B/C/D/F" }],
    75: [{ type: "GROUP_WINNER", group: "F" }, { type: "GROUP_RUNNER_UP", group: "C" }],
    76: [{ type: "GROUP_WINNER", group: "C" }, { type: "GROUP_RUNNER_UP", group: "F" }],
    77: [{ type: "GROUP_WINNER", group: "I" }, { type: "THIRD_PLACE", groups: "C/D/F/G/H" }],
    78: [{ type: "GROUP_RUNNER_UP", group: "E" }, { type: "GROUP_RUNNER_UP", group: "I" }],
    79: [{ type: "GROUP_WINNER", group: "A" }, { type: "THIRD_PLACE", groups: "C/E/F/H/I" }],
    80: [{ type: "GROUP_WINNER", group: "L" }, { type: "THIRD_PLACE", groups: "E/H/I/J/K" }],
    81: [{ type: "GROUP_WINNER", group: "D" }, { type: "THIRD_PLACE", groups: "B/E/F/I/J" }],
    82: [{ type: "GROUP_WINNER", group: "G" }, { type: "THIRD_PLACE", groups: "A/E/H/I/J" }],
    83: [{ type: "GROUP_RUNNER_UP", group: "K" }, { type: "GROUP_RUNNER_UP", group: "L" }],
    84: [{ type: "GROUP_WINNER", group: "H" }, { type: "GROUP_RUNNER_UP", group: "J" }],
    85: [{ type: "GROUP_WINNER", group: "B" }, { type: "THIRD_PLACE", groups: "E/F/G/I/J" }],
    86: [{ type: "GROUP_WINNER", group: "J" }, { type: "GROUP_RUNNER_UP", group: "H" }],
    87: [{ type: "GROUP_WINNER", group: "K" }, { type: "THIRD_PLACE", groups: "D/E/I/J/L" }],
    88: [{ type: "GROUP_RUNNER_UP", group: "D" }, { type: "GROUP_RUNNER_UP", group: "G" }],
    89: [{ type: "MATCH_WINNER", matchNumber: 74 }, { type: "MATCH_WINNER", matchNumber: 77 }],
    90: [{ type: "MATCH_WINNER", matchNumber: 73 }, { type: "MATCH_WINNER", matchNumber: 75 }],
    91: [{ type: "MATCH_WINNER", matchNumber: 76 }, { type: "MATCH_WINNER", matchNumber: 78 }],
    92: [{ type: "MATCH_WINNER", matchNumber: 79 }, { type: "MATCH_WINNER", matchNumber: 80 }],
    93: [{ type: "MATCH_WINNER", matchNumber: 83 }, { type: "MATCH_WINNER", matchNumber: 84 }],
    94: [{ type: "MATCH_WINNER", matchNumber: 81 }, { type: "MATCH_WINNER", matchNumber: 82 }],
    95: [{ type: "MATCH_WINNER", matchNumber: 86 }, { type: "MATCH_WINNER", matchNumber: 88 }],
    96: [{ type: "MATCH_WINNER", matchNumber: 85 }, { type: "MATCH_WINNER", matchNumber: 87 }],
    97: [{ type: "MATCH_WINNER", matchNumber: 89 }, { type: "MATCH_WINNER", matchNumber: 90 }],
    98: [{ type: "MATCH_WINNER", matchNumber: 93 }, { type: "MATCH_WINNER", matchNumber: 94 }],
    99: [{ type: "MATCH_WINNER", matchNumber: 91 }, { type: "MATCH_WINNER", matchNumber: 92 }],
    100: [{ type: "MATCH_WINNER", matchNumber: 95 }, { type: "MATCH_WINNER", matchNumber: 96 }],
    101: [{ type: "MATCH_WINNER", matchNumber: 97 }, { type: "MATCH_WINNER", matchNumber: 98 }],
    102: [{ type: "MATCH_WINNER", matchNumber: 99 }, { type: "MATCH_WINNER", matchNumber: 100 }],
    103: [{ type: "MATCH_LOSER", matchNumber: 101 }, { type: "MATCH_LOSER", matchNumber: 102 }],
    104: [{ type: "MATCH_WINNER", matchNumber: 101 }, { type: "MATCH_WINNER", matchNumber: 102 }],
  };

  it("matches every official home and away source", () => {
    for (const def of BRACKET_TOPOLOGY) {
      expect(
        [def.homeSource, def.awaySource],
        `M${def.matchNumber} sources differ from article 12`,
      ).toEqual(expectedSources[def.matchNumber]);
    }
  });
});
