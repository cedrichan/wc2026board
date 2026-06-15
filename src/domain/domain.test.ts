import { describe, expect, it } from "vitest";
import {
  FINISHED_STATUSES,
  INTERRUPTED_STATUSES,
  LIVE_STATUSES,
  type BracketMatchDefinition,
  type DataDiagnostics,
  type Match,
  type MatchScore,
  type ParticipantSlot,
  type StandingRow,
  type Team,
  type ThirdPlaceRankingRow,
  type TournamentSnapshot,
} from "./index";

describe("MatchScore", () => {
  it("distinguishes null from zero", () => {
    const scheduled: MatchScore = { home: null, away: null };
    const scoreless: MatchScore = { home: 0, away: 0 };

    expect(scheduled.home).toBeNull();
    expect(scheduled.away).toBeNull();
    expect(scoreless.home).toBe(0);
    expect(scoreless.away).toBe(0);
    expect(scheduled.home).not.toBe(scoreless.home);
  });
});

describe("Match status sets", () => {
  it("LIVE_STATUSES covers all in-progress states", () => {
    expect(LIVE_STATUSES.has("FIRST_HALF")).toBe(true);
    expect(LIVE_STATUSES.has("HALF_TIME")).toBe(true);
    expect(LIVE_STATUSES.has("SECOND_HALF")).toBe(true);
    expect(LIVE_STATUSES.has("EXTRA_TIME")).toBe(true);
    expect(LIVE_STATUSES.has("EXTRA_TIME_BREAK")).toBe(true);
    expect(LIVE_STATUSES.has("PENALTY_SHOOTOUT")).toBe(true);
    expect(LIVE_STATUSES.has("SCHEDULED")).toBe(false);
    expect(LIVE_STATUSES.has("FINISHED")).toBe(false);
  });

  it("FINISHED_STATUSES covers all completion variants", () => {
    expect(FINISHED_STATUSES.has("FINISHED")).toBe(true);
    expect(FINISHED_STATUSES.has("FINISHED_AFTER_EXTRA_TIME")).toBe(true);
    expect(FINISHED_STATUSES.has("FINISHED_AFTER_PENALTIES")).toBe(true);
    expect(FINISHED_STATUSES.has("FIRST_HALF")).toBe(false);
  });

  it("INTERRUPTED_STATUSES covers postponed/suspended/cancelled", () => {
    expect(INTERRUPTED_STATUSES.has("POSTPONED")).toBe(true);
    expect(INTERRUPTED_STATUSES.has("SUSPENDED")).toBe(true);
    expect(INTERRUPTED_STATUSES.has("CANCELLED")).toBe(true);
    expect(INTERRUPTED_STATUSES.has("FINISHED")).toBe(false);
  });
});

describe("Match variants", () => {
  const base = {
    id: "m1",
    matchNumber: 73,
    round: "ROUND_OF_32" as const,
    kickoffUtc: "2026-06-16T18:00:00Z",
    homeTeamId: "usa",
    awayTeamId: "aus",
  };

  it("scheduled match has no score fields", () => {
    const match: Match = { ...base, status: "SCHEDULED" };
    expect(match.normalTime).toBeUndefined();
    expect(match.extraTime).toBeUndefined();
    expect(match.penalties).toBeUndefined();
  });

  it("live 0-0 match has numeric zero scores, not null", () => {
    const match: Match = {
      ...base,
      status: "FIRST_HALF",
      elapsedMinutes: 23,
      normalTime: { home: 0, away: 0 },
    };
    expect(match.normalTime!.home).toBe(0);
    expect(match.normalTime!.away).toBe(0);
  });

  it("penalty shootout tracks shootout score separately from normalTime", () => {
    const match: Match = {
      ...base,
      status: "FINISHED_AFTER_PENALTIES",
      normalTime: { home: 2, away: 2 },
      extraTime: { home: 0, away: 0 },
      penalties: { home: 5, away: 4 },
      winnerTeamId: "usa",
    };
    expect(match.normalTime!.home).toBe(2);
    expect(match.penalties!.home).toBe(5);
    // Penalty score does not add to normal time
    expect(match.normalTime!.home).not.toBe(
      match.normalTime!.home! + match.penalties!.home!,
    );
  });

  it("extra time in progress with null penalties", () => {
    const match: Match = {
      ...base,
      status: "EXTRA_TIME",
      elapsedMinutes: 98,
      normalTime: { home: 1, away: 1 },
      extraTime: { home: 0, away: 0 },
      penalties: undefined,
    };
    expect(match.penalties).toBeUndefined();
  });

  it("group-stage match has group set", () => {
    const match: Match = {
      ...base,
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      status: "FINISHED",
      normalTime: { home: 3, away: 1 },
      winnerTeamId: "usa",
    };
    expect(match.group).toBe("A");
  });

  it("match with UNKNOWN status is representable", () => {
    const match: Match = { ...base, status: "UNKNOWN" };
    expect(match.status).toBe("UNKNOWN");
  });
});

describe("ParticipantSlot states", () => {
  it("placeholder slot has a label and no teamId", () => {
    const slot: ParticipantSlot = {
      state: "PLACEHOLDER",
      label: "Winner M73",
    };
    expect(slot.teamId).toBeUndefined();
    expect(slot.label).toBe("Winner M73");
  });

  it("projected slot has teamId and qualificationSource", () => {
    const slot: ParticipantSlot = {
      state: "PROJECTED",
      teamId: "usa",
      qualificationSource: "Projected winner of Group A",
    };
    expect(slot.teamId).toBe("usa");
    expect(slot.qualificationSource).toBeDefined();
  });

  it("confirmed slot has teamId with no qualificationSource required", () => {
    const slot: ParticipantSlot = {
      state: "CONFIRMED",
      teamId: "usa",
    };
    expect(slot.qualificationSource).toBeUndefined();
  });

  it("provisional unresolved slot can retain a known team", () => {
    const slot: ParticipantSlot = {
      state: "UNRESOLVED",
      teamId: "usa",
      provisional: true,
      unresolvedReason: "The winner of Group A is provisional",
    };
    expect(slot.teamId).toBe("usa");
    expect(slot.provisional).toBe(true);
  });

  it("superseded slot retains previous teamId", () => {
    const slot: ParticipantSlot = {
      state: "SUPERSEDED",
      teamId: "aus",
    };
    expect(slot.state).toBe("SUPERSEDED");
  });

  it("third-place placeholder uses group combination label", () => {
    const slot: ParticipantSlot = {
      state: "PLACEHOLDER",
      label: "3A/B/C/D/F",
    };
    expect(slot.label).toBe("3A/B/C/D/F");
  });
});

describe("StandingRow", () => {
  it("conductScore is optional to represent unavailable data", () => {
    const row: StandingRow = {
      teamId: "usa",
      position: 1,
      played: 3,
      wins: 2,
      draws: 1,
      losses: 0,
      goalsFor: 5,
      goalsAgainst: 2,
      goalDifference: 3,
      points: 7,
      qualification: "DIRECT",
      provisional: false,
    };
    expect(row.conductScore).toBeUndefined();
  });

  it("provisional row with UNRESOLVED qualification", () => {
    const row: StandingRow = {
      teamId: "aus",
      position: 2,
      played: 3,
      wins: 1,
      draws: 1,
      losses: 1,
      goalsFor: 3,
      goalsAgainst: 3,
      goalDifference: 0,
      points: 4,
      qualification: "UNRESOLVED",
      tiebreakerUsed: "goal_difference",
      provisional: true,
    };
    expect(row.provisional).toBe(true);
    expect(row.qualification).toBe("UNRESOLVED");
  });
});

describe("ThirdPlaceRankingRow", () => {
  it("conductScore undefined means unavailable, not zero", () => {
    const row: ThirdPlaceRankingRow = {
      rank: 1,
      groupId: "A",
      teamId: "usa",
      played: 3,
      goalDifference: 4,
      goalsFor: 6,
      points: 7,
      qualifying: true,
      provisional: false,
    };
    expect(row.conductScore).toBeUndefined();
  });
});

describe("DataDiagnostics", () => {
  it("provider is always espn", () => {
    const diag: DataDiagnostics = {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [],
      missingFields: [],
    };
    expect(diag.provider).toBe("espn");
  });

  it("records unresolved tiebreaker with criterion and team ids", () => {
    const diag: DataDiagnostics = {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [
        {
          groupId: "B",
          teamIds: ["team1", "team2"],
          criterion: "conduct_score",
        },
      ],
      missingFields: ["disciplinaryEvents"],
    };
    expect(diag.unresolvedTiebreakers[0].criterion).toBe("conduct_score");
    expect(diag.missingFields).toContain("disciplinaryEvents");
  });

  it("records cross-group third-place tiebreaker without groupId", () => {
    const diag: DataDiagnostics = {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [
        {
          teamIds: ["team3", "team4"],
          criterion: "fifa_ranking",
        },
      ],
      missingFields: [],
    };
    expect(diag.unresolvedTiebreakers[0].groupId).toBeUndefined();
  });
});

describe("TournamentSnapshot", () => {
  const team: Team = {
    id: "usa",
    fifaCode: "USA",
    name: "United States",
    shortName: "USA",
    group: "A",
  };

  it("includes schemaVersion and tournamentId for cache validation", () => {
    const snapshot: TournamentSnapshot = {
      generatedAt: "2026-06-16T20:00:00Z",
      schemaVersion: "1",
      tournamentId: "fifa.world.2026",
      stale: false,
      teams: [team],
      matches: [],
      diagnostics: {
        provider: "espn",
        warnings: [],
        unresolvedTiebreakers: [],
        missingFields: [],
      },
    };
    expect(snapshot.schemaVersion).toBe("1");
    expect(snapshot.tournamentId).toBe("fifa.world.2026");
  });

  it("stale snapshot with sourceUpdatedAt", () => {
    const snapshot: TournamentSnapshot = {
      generatedAt: "2026-06-16T20:05:00Z",
      sourceUpdatedAt: "2026-06-16T19:55:00Z",
      schemaVersion: "1",
      tournamentId: "fifa.world.2026",
      stale: true,
      teams: [],
      matches: [],
      diagnostics: {
        provider: "espn",
        warnings: ["ESPN returned stale data"],
        unresolvedTiebreakers: [],
        missingFields: [],
      },
    };
    expect(snapshot.stale).toBe(true);
    expect(snapshot.sourceUpdatedAt).toBeDefined();
  });
});

describe("BracketMatchDefinition", () => {
  it("round-of-32 match with group winner and third-place sources", () => {
    const def: BracketMatchDefinition = {
      matchNumber: 73,
      round: "ROUND_OF_32",
      homeSource: { type: "GROUP_WINNER", group: "A" },
      awaySource: { type: "THIRD_PLACE", groups: "C/D/E/F" },
      winnerFeedsMatch: 89,
      winnerFeedsSide: "HOME",
    };
    expect(def.homeSource.type).toBe("GROUP_WINNER");
    expect(def.awaySource.type).toBe("THIRD_PLACE");
  });

  it("knockout match fed by prior match winner", () => {
    const def: BracketMatchDefinition = {
      matchNumber: 89,
      round: "ROUND_OF_16",
      homeSource: { type: "MATCH_WINNER", matchNumber: 73 },
      awaySource: { type: "MATCH_WINNER", matchNumber: 74 },
      winnerFeedsMatch: 97,
      winnerFeedsSide: "HOME",
    };
    if (def.homeSource.type === "MATCH_WINNER") {
      expect(def.homeSource.matchNumber).toBe(73);
    }
  });

  it("final has no winnerFeedsMatch", () => {
    const def: BracketMatchDefinition = {
      matchNumber: 104,
      round: "FINAL",
      homeSource: { type: "MATCH_WINNER", matchNumber: 102 },
      awaySource: { type: "MATCH_WINNER", matchNumber: 103 },
    };
    expect(def.winnerFeedsMatch).toBeUndefined();
  });
});
