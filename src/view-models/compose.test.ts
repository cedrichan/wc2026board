import { describe, it, expect } from "vitest";
import { composeDashboardViewModel } from "./compose";
import type { DashboardFormatOptions } from "./dashboard";
import type { Match, Team, TournamentSnapshot } from "../domain";

const OPTIONS: DashboardFormatOptions = {
  locale: "en-US",
  timeDisplayMode: "UTC",
  now: new Date("2026-06-22T20:10:00Z"),
};

function team(id: string): Team {
  return { id, fifaCode: id.toUpperCase(), name: id, shortName: id, group: "A" };
}

let matchSeq = 0;
function finished(home: string, away: string, hs: number, as: number): Match {
  matchSeq += 1;
  return {
    id: `m${matchSeq}`,
    matchNumber: matchSeq,
    round: "GROUP_STAGE",
    group: "A",
    kickoffUtc: "2026-06-18T18:00:00Z",
    status: "FINISHED",
    homeTeamId: home,
    awayTeamId: away,
    normalTime: { home: hs, away: as },
  };
}

/**
 * Group A where a1 and a2 are level on 6 points from finished matches and the
 * still-live a1 v a2 fixture decides first and second place. `liveHome`/
 * `liveAway` set that live scoreline.
 */
function groupASnapshot(liveHome: number, liveAway: number): TournamentSnapshot {
  matchSeq = 0;
  const teams = [team("a1"), team("a2"), team("a3"), team("a4")];
  const matches: Match[] = [
    finished("a1", "a3", 3, 0),
    finished("a1", "a4", 3, 0),
    finished("a2", "a3", 3, 0),
    finished("a2", "a4", 3, 0),
    finished("a3", "a4", 0, 0),
    {
      id: "m-live",
      matchNumber: 6,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-22T18:00:00Z",
      status: "SECOND_HALF",
      elapsedMinutes: 70,
      homeTeamId: "a1",
      awayTeamId: "a2",
      normalTime: { home: liveHome, away: liveAway },
    },
  ];
  return {
    generatedAt: "2026-06-22T20:10:00Z",
    schemaVersion: "1",
    tournamentId: "fifa.world.2026",
    stale: false,
    teams,
    matches,
    diagnostics: {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [],
      missingFields: [],
    },
  };
}

// Goal-difference for each group's third-place team, chosen so the ranking is
// fully resolved with a clear top eight and Group D on the 8/9 boundary. Group
// D's value is supplied live via the test.
const THIRD_PLACE_MARGIN: Record<string, number> = {
  L: 21, K: 20, J: 19, I: 18, H: 17, G: 16, F: 15, E: 7, C: 5, B: 4, A: 3,
};

/**
 * Builds a complete 12-group snapshot. Every group is a finished round-robin
 * where g1/g2/g3/g4 finish on 9/6/3/0 points; the third-place team's goal
 * difference is tuned per group via the winning margin of its g3-v-g4 match.
 * The named `liveGroup` leaves that match in progress with the given margin.
 */
function twelveGroupSnapshot(liveGroup: string, liveMargin: number): TournamentSnapshot {
  const groups = "ABCDEFGHIJKL".split("");
  const teams: Team[] = [];
  const matches: Match[] = [];
  let number = 0;

  for (const letter of groups) {
    const t = [1, 2, 3, 4].map((n) => `${letter.toLowerCase()}${n}`);
    for (const id of t) {
      teams.push({
        id,
        fifaCode: id.toUpperCase(),
        name: id,
        shortName: id,
        group: letter as Team["group"],
      });
    }

    const margin = letter === liveGroup ? liveMargin : THIRD_PLACE_MARGIN[letter];
    // 9/6/3/0 cascade: 1 beats all, 2 beats 3 & 4, 3 beats 4 by `margin`.
    const results: Array<[string, string, number, number]> = [
      [t[0], t[1], 1, 0],
      [t[0], t[2], 1, 0],
      [t[0], t[3], 1, 0],
      [t[1], t[2], 1, 0],
      [t[1], t[3], 1, 0],
      [t[2], t[3], margin, 0],
    ];

    results.forEach(([home, away, hs, as], index) => {
      number += 1;
      const isLiveDecider = letter === liveGroup && index === results.length - 1;
      matches.push({
        id: `m${number}`,
        matchNumber: number,
        round: "GROUP_STAGE",
        group: letter as Match["group"],
        kickoffUtc: "2026-06-18T18:00:00Z",
        status: isLiveDecider ? "SECOND_HALF" : "FINISHED",
        ...(isLiveDecider ? { elapsedMinutes: 70 } : {}),
        homeTeamId: home,
        awayTeamId: away,
        normalTime: { home: hs, away: as },
      });
    });
  }

  return {
    generatedAt: "2026-06-22T20:10:00Z",
    schemaVersion: "1",
    tournamentId: "fifa.world.2026",
    stale: false,
    teams,
    matches,
    diagnostics: {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [],
      missingFields: [],
    },
  };
}

describe("composeDashboardViewModel", () => {
  it("builds a complete dashboard view model from a snapshot", () => {
    const viewModel = composeDashboardViewModel(groupASnapshot(1, 0), OPTIONS);

    expect(viewModel.id).toBe("dashboard");
    expect(viewModel.header.id).toBe("dashboard-header");

    // Full knockout topology: M73-M104.
    const byRound = (round: string) =>
      viewModel.bracket.find((r) => r.round === round)?.matches.length ?? 0;
    expect(byRound("ROUND_OF_32")).toBe(16);
    expect(byRound("ROUND_OF_16")).toBe(8);
    expect(byRound("QUARTER_FINAL")).toBe(4);
    expect(byRound("SEMI_FINAL")).toBe(2);
    expect(byRound("THIRD_PLACE")).toBe(1);
    expect(byRound("FINAL")).toBe(1);

    // Always exactly 12 group slots and the third-place table.
    expect(viewModel.groups).toHaveLength(12);
    expect(viewModel.thirdPlace.id).toBe("third-place-table");
  });

  it("reports the live match in the header", () => {
    const viewModel = composeDashboardViewModel(groupASnapshot(1, 0), OPTIONS);
    expect(viewModel.header.live.isLive).toBe(true);
    expect(viewModel.header.live.count).toBe(1);
  });

  it("propagates a live group-score change to group standings", () => {
    const groupA = (snapshot: TournamentSnapshot) =>
      composeDashboardViewModel(snapshot, OPTIONS).groups.find(
        (group) => group.groupId === "A",
      )!;

    const a1Leads = groupA(groupASnapshot(1, 0));
    const a2Leads = groupA(groupASnapshot(0, 1));

    expect(a1Leads.live).toBe(true);
    expect(a1Leads.rows[0].team.id).toBe("a1");
    expect(a2Leads.rows[0].team.id).toBe("a2");
  });

  it("propagates a live group-score change to the projected bracket", () => {
    const projectedGroupAWinner = (snapshot: TournamentSnapshot) => {
      const viewModel = composeDashboardViewModel(snapshot, OPTIONS);
      for (const round of viewModel.bracket) {
        for (const match of round.matches) {
          for (const participant of [match.home, match.away]) {
            if (/winner of Group A/i.test(participant.sourceExplanation ?? "")) {
              expect(participant.state).toBe("PROJECTED");
              return participant.team?.id;
            }
          }
        }
      }
      return undefined;
    };

    expect(projectedGroupAWinner(groupASnapshot(1, 0))).toBe("a1");
    expect(projectedGroupAWinner(groupASnapshot(0, 1))).toBe("a2");
  });

  it("propagates a live group-score change to the third-place ranking", () => {
    // Group D's third-place team sits right at the 8/9 qualification boundary;
    // a larger live winning margin lifts its goal difference above Group E's.
    const groupDThird = (margin: number) => {
      const viewModel = composeDashboardViewModel(
        twelveGroupSnapshot("D", margin),
        OPTIONS,
      );
      expect(viewModel.thirdPlace.boundaryResolved).toBe(true);
      expect(viewModel.thirdPlace.rows).toHaveLength(12);
      return viewModel.thirdPlace.rows.find((row) => row.groupId === "D")!;
    };

    const outside = groupDThird(6); // GD +4 -> rank 9
    const qualifying = groupDThird(8); // GD +6 -> rank 8

    expect(outside.qualifying).toBe(false);
    expect(qualifying.qualifying).toBe(true);
    expect(qualifying.rank).toBeLessThan(outside.rank);
  });

  it("degrades without throwing when no group data is present", () => {
    const empty: TournamentSnapshot = {
      generatedAt: "2026-06-22T20:10:00Z",
      schemaVersion: "1",
      tournamentId: "fifa.world.2026",
      stale: false,
      teams: [],
      matches: [],
      diagnostics: {
        provider: "espn",
        warnings: [],
        unresolvedTiebreakers: [],
        missingFields: [],
      },
    };

    const viewModel = composeDashboardViewModel(empty, OPTIONS);
    expect(viewModel.groups).toHaveLength(12);
    expect(viewModel.thirdPlace.rows).toHaveLength(0);
    expect(viewModel.bracket.find((r) => r.round === "ROUND_OF_32")?.matches).toHaveLength(16);
  });
});
