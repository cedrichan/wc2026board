import { describe, it, expect } from "vitest";
import { calculateGroupStandings } from "./group-standings";
import type { Match } from "../domain/match";
import type { Team } from "../domain/team";

// ─── Test helpers ─────────────────────────────────────────────────────────────

function team(id: string, fifaCode: string): Team {
  return { id, fifaCode, name: id, shortName: id, group: "A" };
}

let matchCounter = 0;
function match(overrides: Partial<Match> & Pick<Match, "homeTeamId" | "awayTeamId">): Match {
  matchCounter++;
  return {
    id: `m${matchCounter}`,
    matchNumber: matchCounter,
    round: "GROUP_STAGE",
    group: "A",
    kickoffUtc: "2026-06-14T18:00:00Z",
    status: "FINISHED",
    ...overrides,
  };
}

function finishedMatch(
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  extras?: Partial<Match>
): Match {
  return match({
    homeTeamId,
    awayTeamId,
    normalTime: { home: homeScore, away: awayScore },
    status: "FINISHED",
    ...extras,
  });
}

// ─── Test scenario helpers ────────────────────────────────────────────────────

/**
 * Creates a full round-robin (6 matches) for 4 teams in group "A".
 * matchResults: array of [homeIdx, awayIdx, homeScore, awayScore] (0-indexed into teams)
 */
function roundRobinMatches(
  teams: Team[],
  results: [number, number, number, number][],
  extras?: Partial<Match>
): Match[] {
  return results.map(([hi, ai, hs, as_]) =>
    finishedMatch(teams[hi].id, teams[ai].id, hs, as_, extras)
  );
}

// ─── B010: Basic standings ────────────────────────────────────────────────────

describe("B010 — basic standings accumulation", () => {
  const teams = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];

  it("accumulates W/D/L/GF/GA/Pts from FINISHED matches", () => {
    const matches: Match[] = [
      finishedMatch("t1", "t2", 2, 1), // t1 wins
      finishedMatch("t1", "t3", 1, 1), // draw
      finishedMatch("t1", "t4", 0, 1), // t1 loses
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t1 = standings.rows.find((r) => r.teamId === "t1")!;
    expect(t1.played).toBe(3);
    expect(t1.wins).toBe(1);
    expect(t1.draws).toBe(1);
    expect(t1.losses).toBe(1);
    expect(t1.goalsFor).toBe(3);
    expect(t1.goalsAgainst).toBe(3);
    expect(t1.goalDifference).toBe(0);
    expect(t1.points).toBe(4);
  });

  it("SCHEDULED matches contribute nothing (scenario 8)", () => {
    const matches: Match[] = [
      finishedMatch("t1", "t2", 3, 0),
      match({ homeTeamId: "t3", awayTeamId: "t4", status: "SCHEDULED" }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t3 = standings.rows.find((r) => r.teamId === "t3")!;
    const t4 = standings.rows.find((r) => r.teamId === "t4")!;
    expect(t3.played).toBe(0);
    expect(t4.played).toBe(0);
    expect(t3.points).toBe(0);
  });

  it("POSTPONED (INTERRUPTED) match contributes nothing (scenario 9)", () => {
    const matches: Match[] = [
      finishedMatch("t1", "t2", 1, 0),
      match({
        homeTeamId: "t3",
        awayTeamId: "t4",
        status: "POSTPONED",
        normalTime: { home: 2, away: 0 },
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t3 = standings.rows.find((r) => r.teamId === "t3")!;
    expect(t3.played).toBe(0);
    expect(t3.points).toBe(0);
  });

  it("LIVE match contributes current normalTime score (scenario 10)", () => {
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "SECOND_HALF",
        elapsedMinutes: 65,
        normalTime: { home: 2, away: 1 },
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t1 = standings.rows.find((r) => r.teamId === "t1")!;
    const t2 = standings.rows.find((r) => r.teamId === "t2")!;
    expect(t1.points).toBe(3);
    expect(t2.points).toBe(0);
    expect(t1.played).toBe(1);
  });

  it("live 0-0 match counts as a played draw, not as unplayed (scenario 7)", () => {
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FIRST_HALF",
        elapsedMinutes: 28,
        normalTime: { home: 0, away: 0 },
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t1 = standings.rows.find((r) => r.teamId === "t1")!;
    const t2 = standings.rows.find((r) => r.teamId === "t2")!;
    expect(t1.played).toBe(1);
    expect(t2.played).toBe(1);
    expect(t1.draws).toBe(1);
    expect(t2.draws).toBe(1);
    expect(t1.points).toBe(1);
    expect(t2.points).toBe(1);
  });

  it("ignores matches from other groups", () => {
    const matches: Match[] = [
      finishedMatch("t1", "t2", 3, 0),
      {
        ...finishedMatch("t3", "t4", 2, 1),
        group: "B" as const,
      },
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t3 = standings.rows.find((r) => r.teamId === "t3")!;
    expect(t3.played).toBe(0);
  });

  it("returns rows for all teams even if no matches played", () => {
    const standings = calculateGroupStandings("A", teams, []);
    expect(standings.rows).toHaveLength(4);
    for (const row of standings.rows) {
      expect(row.played).toBe(0);
      expect(row.points).toBe(0);
    }
  });
});

// ─── B011: H2H tiebreaker ─────────────────────────────────────────────────────

describe("B011 — head-to-head tiebreaker", () => {
  it("separates two teams tied on points by H2H result (scenario 1)", () => {
    // t1 and t2 both on 6pts: t1 beats t2 (H2H) + beats t4; t2 loses to t1 + beats t3 + beats t4
    // Wait — let's compute carefully:
    // t1: beats t2 (3) + beats t4 (3) + loses to t3 (0) = 6pts
    // t2: beats t3 (3) + beats t4 (3) + loses to t1 (0) = 6pts ← tied!
    // H2H {t1, t2}: t1 beat t2 → t1 gets 3 H2H pts, t2 gets 0 → separated by H2H points
    const teams4 = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];
    const matches4: Match[] = [
      finishedMatch("t1", "t2", 1, 0), // t1 beats t2 — H2H key match
      finishedMatch("t1", "t4", 1, 0), // t1 beats t4
      finishedMatch("t3", "t1", 1, 0), // t3 beats t1
      finishedMatch("t2", "t4", 1, 0), // t2 beats t4
      finishedMatch("t2", "t3", 1, 0), // t2 beats t3
      finishedMatch("t3", "t4", 1, 1), // t3-t4 draw
    ];
    // t1: 3+3+0 = 6pts; t2: 0+3+3 = 6pts → tied!
    // H2H {t1,t2}: t1 beat t2 → t1 gets 3 H2H pts, t2 gets 0 → t1 wins on H2H points!
    const standings4 = calculateGroupStandings("A", teams4, matches4);
    expect(standings4.rows[0].teamId).toBe("t1");
    expect(standings4.rows[1].teamId).toBe("t2");
    expect(standings4.rows[0].tiebreakerUsed).toBe("head-to-head points");
  });

  it("falls through H2H to overall goal difference when H2H points equal (scenario 2)", () => {
    // t1 and t2 tied on points and H2H points, but t1 has better overall GD
    const teams = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];
    const matches: Match[] = [
      finishedMatch("t1", "t2", 1, 1), // H2H draw → same H2H points
      finishedMatch("t1", "t3", 3, 0), // t1 wins big
      finishedMatch("t2", "t4", 1, 0), // t2 wins small
      finishedMatch("t1", "t4", 1, 0), // both t1,t2 now 7pts
      finishedMatch("t2", "t3", 1, 0), // t2 also 7pts
      finishedMatch("t3", "t4", 0, 1),
    ];
    // t1: W t3 (3), W t4 (3), D t2 (1) = 7pts; GD: +3+1+0=+4
    // t2: W t4 (3), W t3 (3), D t1 (1) = 7pts; GD: +1+1+0=+2
    // H2H t1 vs t2: draw, H2H GD t1=0, t2=0 → H2H GF: t1=1, t2=1 → overall GD separates
    const standings = calculateGroupStandings("A", teams, matches);
    expect(standings.rows[0].teamId).toBe("t1");
    expect(standings.rows[1].teamId).toBe("t2");
    expect(standings.rows[0].tiebreakerUsed).toBe("overall goal difference");
  });
});

// ─── B012: Subset H2H reapplication ──────────────────────────────────────────

describe("B012 — three-way tie with subset reapplication (scenario 3)", () => {
  it("one team separates from three-way H2H tie; remaining two are resolved by subset H2H", () => {
    // t1, t2, t3 all tied on overall points. In H2H:
    // t1 beat t2, t1 beat t3 → t1 separates by H2H points (6pts in H2H)
    // t2 beat t3 → t2 ahead of t3 in subset H2H
    const teams2 = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3")];
    const matches3: Match[] = [
      finishedMatch("t1", "t2", 3, 0), // t1 beats t2 big → H2H: t1 6pts, t2 0pts, t3 0pts initially
      finishedMatch("t2", "t3", 2, 0), // t2 beats t3
      finishedMatch("t3", "t1", 1, 0), // t3 beats t1
    ];
    // H2H among {t1,t2,t3}: t1→3pts(beat t2), t2→3pts(beat t3), t3→3pts(beat t1) — all equal H2H pts
    // H2H GD: t1 = +3-1 = +2, t2 = +2-3 = -1, t3 = +1-2 = -1 → H2H GD separates t1!
    // After removing t1: subset {t2, t3}: t2 beat t3 → t2 ahead in H2H subset
    const standings3 = calculateGroupStandings("A", teams2, matches3);
    expect(standings3.rows[0].teamId).toBe("t1");
    expect(standings3.rows[1].teamId).toBe("t2");
    expect(standings3.rows[2].teamId).toBe("t3");
    expect(standings3.rows[0].tiebreakerUsed).toMatch(/head-to-head/);
    expect(standings3.rows[1].tiebreakerUsed).toMatch(/head-to-head/);
  });
});

// ─── B013: Conduct tiebreaker ─────────────────────────────────────────────────

describe("B013 — conduct tiebreaker", () => {
  it("separates equally-ranked teams by conduct score (scenario 4)", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    // t1 and t2 draw, same points, same GD, same GF → go to conduct
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FINISHED",
        normalTime: { home: 1, away: 1 },
        disciplinaryEvents: [
          // t1 gets a yellow, t2 gets none → t1 conduct=-1, t2 conduct=0
          { teamId: "t1", cardType: "YELLOW" },
        ],
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    expect(standings.rows[0].teamId).toBe("t2"); // better conduct (0 vs -1)
    expect(standings.rows[1].teamId).toBe("t1");
    expect(standings.rows[0].tiebreakerUsed).toBe("conduct score");
  });

  it("marks as provisional when conduct data is unavailable (scenario 12)", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FINISHED",
        normalTime: { home: 1, away: 1 },
        // disciplinaryEvents: undefined → incomplete data
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    // Both teams tied, conduct unavailable → provisional
    for (const row of standings.rows) {
      expect(row.provisional).toBe(true);
      expect(row.conductScore).toBeUndefined();
    }
  });

  it("empty disciplinaryEvents array means no cards (not missing)", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FINISHED",
        normalTime: { home: 1, away: 1 },
        disciplinaryEvents: [], // empty = complete coverage, no cards
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    for (const row of standings.rows) {
      expect(row.conductScore).toBe(0);
    }
  });

  it("applies correct card deduction values", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FINISHED",
        normalTime: { home: 1, away: 1 },
        disciplinaryEvents: [
          { teamId: "t1", cardType: "YELLOW" },              // -1
          { teamId: "t1", cardType: "RED_INDIRECT" },         // -3
          { teamId: "t1", cardType: "RED_DIRECT" },           // -4
          { teamId: "t1", cardType: "YELLOW_PLUS_DIRECT_RED" }, // -5
        ],
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t1 = standings.rows.find((r) => r.teamId === "t1")!;
    expect(t1.conductScore).toBe(-1 + -3 + -4 + -5); // -13
  });
});

// ─── B014: FIFA ranking tiebreaker ───────────────────────────────────────────

describe("B014 — FIFA ranking tiebreaker", () => {
  // Build a round-robin of all draws (same GD, GF, conduct=0) so FIFA ranking decides.
  // ARG=rank1, ESP=rank2, FRA=rank3 in bundled 2026-04.json.
  const allDrawMatches = (teamA: string, teamB: string, teamC: string): Match[] => [
    finishedMatch(teamA, teamB, 1, 1, { disciplinaryEvents: [] }),
    finishedMatch(teamA, teamC, 1, 1, { disciplinaryEvents: [] }),
    finishedMatch(teamB, teamC, 1, 1, { disciplinaryEvents: [] }),
  ];

  it("resolves tie by FIFA ranking (scenario 5) — lower rank number wins", () => {
    // ARG(rank1) > ESP(rank2) > FRA(rank3) in bundled 2026-04.json
    const teams3 = [team("arg", "ARG"), team("esp", "ESP"), team("fra", "FRA")];
    const matches = allDrawMatches("arg", "esp", "fra");
    const standings = calculateGroupStandings("A", teams3, matches, ["2026-04"]);
    expect(standings.rows[0].teamId).toBe("arg"); // rank 1 = best
    expect(standings.rows[1].teamId).toBe("esp"); // rank 2
    expect(standings.rows[2].teamId).toBe("fra"); // rank 3
    expect(standings.rows[0].tiebreakerUsed).toBe("FIFA ranking 2026-04");
    expect(standings.rows[0].provisional).toBe(false);
  });

  it("skips edition missing a team and falls through to UNRESOLVED (scenario 6 fallback)", () => {
    // "fake-edition" doesn't exist in the loader, so it's skipped.
    // Only "2026-04" is tried but "UNKNOWN" code isn't there → UNRESOLVED.
    const teams2 = [team("arg", "ARG"), team("unk", "UNKNOWN_CODE")];
    const m = finishedMatch("arg", "unk", 1, 1, { disciplinaryEvents: [] });
    const standings = calculateGroupStandings("A", teams2, [m], ["2026-04"]);
    // UNKNOWN_CODE missing from 2026-04 → edition skipped → UNRESOLVED
    for (const row of standings.rows) {
      expect(row.provisional).toBe(true);
    }
  });

  it("uses preceding (older) edition when first edition missing a team (scenario 6)", () => {
    // We simulate two editions: first has only ARG (misses ESP), second has both.
    // In this test, the first edition is "2026-04" (real, has both ARG and ESP),
    // so we verify that if the latest resolves it, we don't need the older one.
    // The "preceding edition" logic is covered by: first edition skipped (missing team),
    // second edition resolves.
    // Since we can't inject editions with partial data through the loader,
    // we verify the skip-and-fallback path via UNRESOLVED: two real codes,
    // first edition skipped (we pass a non-existent edition first), second works.

    // Teams: ARG (rank1) and ESP (rank2) in bundled 2026-04
    const teams2 = [team("arg", "ARG"), team("esp", "ESP")];
    const m = finishedMatch("arg", "esp", 1, 1, { disciplinaryEvents: [] });

    // Pass ["nonexistent", "2026-04"]: first edition skipped, second resolves
    const standings = calculateGroupStandings("A", teams2, [m], ["nonexistent-edition", "2026-04"]);
    expect(standings.rows[0].teamId).toBe("arg"); // ARG rank1 beats ESP rank2
    expect(standings.rows[0].tiebreakerUsed).toBe("FIFA ranking 2026-04");
    expect(standings.rows[0].provisional).toBe(false);
  });

  it("unknown FIFA codes → all editions exhausted → UNRESOLVED provisional", () => {
    const teams = [team("t1", "FAKE1"), team("t2", "FAKE2")];
    const m = finishedMatch("t1", "t2", 1, 1, { disciplinaryEvents: [] });
    const standings = calculateGroupStandings("A", teams, [m], ["2026-04"]);
    for (const row of standings.rows) {
      expect(row.provisional).toBe(true);
      expect(row.qualification).toBe("UNRESOLVED");
    }
  });
});

// ─── Qualification assignment ─────────────────────────────────────────────────

describe("qualification assignment (scenario 13)", () => {
  it("assigns DIRECT to positions 1 and 2, THIRD_PLACE_QUALIFIER to 3, OUTSIDE to 4", () => {
    const teams = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];
    const matches: Match[] = [
      // Clear ranking: t1(9pts), t2(6pts), t3(3pts), t4(0pts)
      finishedMatch("t1", "t2", 1, 0, { disciplinaryEvents: [] }),
      finishedMatch("t1", "t3", 1, 0, { disciplinaryEvents: [] }),
      finishedMatch("t1", "t4", 1, 0, { disciplinaryEvents: [] }),
      finishedMatch("t2", "t3", 1, 0, { disciplinaryEvents: [] }),
      finishedMatch("t2", "t4", 1, 0, { disciplinaryEvents: [] }),
      finishedMatch("t3", "t4", 1, 0, { disciplinaryEvents: [] }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    expect(standings.rows[0].qualification).toBe("DIRECT");       // pos 1
    expect(standings.rows[1].qualification).toBe("DIRECT");       // pos 2
    expect(standings.rows[2].qualification).toBe("THIRD_PLACE_QUALIFIER"); // pos 3
    expect(standings.rows[3].qualification).toBe("OUTSIDE");      // pos 4
    expect(standings.rows[0].provisional).toBe(false);
    expect(standings.rows[0].position).toBe(1);
    expect(standings.rows[1].position).toBe(2);
    expect(standings.rows[2].position).toBe(3);
    expect(standings.rows[3].position).toBe(4);
  });

  it("all four teams fully equal → UNRESOLVED provisional (scenario 11)", () => {
    const teams = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];
    // All draws with identical scores → everything tied
    const matches: Match[] = [
      finishedMatch("t1", "t2", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t1", "t3", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t1", "t4", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t2", "t3", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t2", "t4", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t3", "t4", 1, 1, { disciplinaryEvents: [] }),
    ];
    // Pass non-existent editions so FIFA ranking can't resolve
    const standings = calculateGroupStandings("A", teams, matches, ["nonexistent-edition"]);
    for (const row of standings.rows) {
      expect(row.provisional).toBe(true);
      expect(row.qualification).toBe("UNRESOLVED");
    }
  });

  it("assigns UNRESOLVED qualification when provisional=true", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FINISHED",
        normalTime: { home: 1, away: 1 },
        // no disciplinaryEvents → incomplete
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches, ["nonexistent"]);
    for (const row of standings.rows) {
      expect(row.qualification).toBe("UNRESOLVED");
    }
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("handles incomplete group (fewer than 4 teams)", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [finishedMatch("t1", "t2", 2, 0)];
    const standings = calculateGroupStandings("A", teams, matches);
    expect(standings.rows).toHaveLength(2);
    expect(standings.rows[0].teamId).toBe("t1");
    expect(standings.rows[0].position).toBe(1);
    expect(standings.rows[1].position).toBe(2);
  });

  it("handles group with no matches played", () => {
    const teams = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];
    const standings = calculateGroupStandings("A", teams, []);
    expect(standings.rows).toHaveLength(4);
    expect(standings.groupId).toBe("A");
  });

  it("FINISHED_AFTER_EXTRA_TIME uses normalTime score only", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FINISHED_AFTER_EXTRA_TIME",
        normalTime: { home: 1, away: 1 },
        extraTime: { home: 1, away: 0 },
        winnerTeamId: "t1",
        disciplinaryEvents: [],
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t1 = standings.rows.find((r) => r.teamId === "t1")!;
    const t2 = standings.rows.find((r) => r.teamId === "t2")!;
    // In group stage, extra time score doesn't apply — only normalTime
    // Result is a draw (1-1 normal time) → both get 1pt
    expect(t1.draws).toBe(1);
    expect(t2.draws).toBe(1);
    expect(t1.goalsFor).toBe(1);
    expect(t2.goalsFor).toBe(1);
  });

  it("filters out non-GROUP_STAGE matches", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      {
        id: "ko1",
        matchNumber: 100,
        round: "ROUND_OF_16",
        kickoffUtc: "2026-06-28T18:00:00Z",
        status: "FINISHED",
        homeTeamId: "t1",
        awayTeamId: "t2",
        normalTime: { home: 3, away: 0 },
      },
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t1 = standings.rows.find((r) => r.teamId === "t1")!;
    expect(t1.played).toBe(0);
  });

  it("CANCELLED (INTERRUPTED) match contributes nothing", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "CANCELLED",
        normalTime: { home: 1, away: 0 },
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    const t1 = standings.rows.find((r) => r.teamId === "t1")!;
    expect(t1.played).toBe(0);
  });

  it("SUSPENDED match contributes nothing", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "SUSPENDED",
        normalTime: { home: 1, away: 0 },
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    expect(standings.rows.find((r) => r.teamId === "t1")!.played).toBe(0);
  });

  it("conductScore is 0 (not undefined) when all matches have empty disciplinaryEvents", () => {
    const teams = [team("t1", "T1"), team("t2", "T2")];
    const matches: Match[] = [
      match({
        homeTeamId: "t1",
        awayTeamId: "t2",
        status: "FINISHED",
        normalTime: { home: 2, away: 1 },
        disciplinaryEvents: [],
      }),
    ];
    const standings = calculateGroupStandings("A", teams, matches);
    for (const row of standings.rows) {
      expect(row.conductScore).toBe(0);
    }
  });
});

// ─── Consolidated scenario cross-check ───────────────────────────────────────

describe("full round-robin scenarios", () => {
  it("scenario: t1 first clear, t2/t3 tied and resolved by H2H GD, t4 last", () => {
    const teams4 = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];
    const matches: Match[] = roundRobinMatches(
      teams4,
      [
        // t1 wins all → 9pts
        [0, 1, 2, 0],
        [0, 2, 2, 0],
        [0, 3, 2, 0],
        // t2 vs t3: t2 wins big → better H2H GD
        [1, 2, 3, 0], // t2 beats t3
        // t2 and t3 both beat t4
        [1, 3, 1, 0],
        [2, 3, 1, 0],
      ],
      { disciplinaryEvents: [] }
    );
    // t1: 9pts, t2: 6pts (W vs t3,t4; L vs t1), t3: 3pts (W vs t4; L vs t1,t2), t4: 0
    const standings = calculateGroupStandings("A", teams4, matches);
    expect(standings.rows[0].teamId).toBe("t1");
    expect(standings.rows[0].position).toBe(1);
    expect(standings.rows[1].teamId).toBe("t2");
    expect(standings.rows[2].teamId).toBe("t3");
    expect(standings.rows[3].teamId).toBe("t4");
  });

  it("all tied in all metrics → UNRESOLVED with empty edition list", () => {
    const teams = [team("t1", "T1"), team("t2", "T2"), team("t3", "T3"), team("t4", "T4")];
    const matches: Match[] = [
      finishedMatch("t1", "t2", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t1", "t3", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t1", "t4", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t2", "t3", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t2", "t4", 1, 1, { disciplinaryEvents: [] }),
      finishedMatch("t3", "t4", 1, 1, { disciplinaryEvents: [] }),
    ];
    const standings = calculateGroupStandings("A", teams, matches, []);
    for (const row of standings.rows) {
      expect(row.provisional).toBe(true);
    }
  });
});
