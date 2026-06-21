import { describe, expect, it } from "vitest";
import type {
  GroupId,
  GroupStandings,
  Match,
  Team,
  ThirdPlaceRanking,
  TournamentSnapshot,
} from "../domain";
import { buildDashboardViewModel, deriveTournamentStage } from "./dashboard";

const GROUPS: readonly GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const OPTIONS = {
  locale: "en-US",
  timeDisplayMode: "UTC" as const,
  now: new Date("2026-06-14T18:00:30Z"),
};

function team(group: GroupId, position: number): Team {
  return {
    id: `team-${group}-${position}`,
    fifaCode: `${group}${position}`,
    name: `Team ${group}${position}`,
    shortName: `${group}${position}`,
    group,
  };
}

function standings(): GroupStandings[] {
  return GROUPS.map((groupId) => ({
    groupId,
    complete: true,
    rows: [1, 2, 3, 4].map((position) => ({
      teamId: `team-${groupId}-${position}`,
      position,
      played: 3,
      wins: position === 1 ? 3 : 1,
      draws: position === 2 ? 2 : 0,
      losses: position === 4 ? 3 : 0,
      goalsFor: 5 - position,
      goalsAgainst: position,
      goalDifference: 5 - position * 2,
      points: 10 - position * 2,
      qualification:
        position <= 2 ? "DIRECT" as const : position === 3 ? "THIRD_PLACE_QUALIFIER" as const : "OUTSIDE" as const,
      provisional: groupId === "A" && position === 3,
      tiebreakerUsed: groupId === "A" && position === 3 ? "conduct score" : undefined,
    })),
  }));
}

function thirdPlaceRanking(): ThirdPlaceRanking {
  return {
    qualificationBoundary: 8,
    boundaryResolved: false,
    diagnostics: [{ teamIds: ["team-H-3", "team-I-3"], criterion: "conduct score", affectsQualification: true }],
    rows: GROUPS.map((groupId, index) => ({
      rank: index + 1,
      groupId,
      teamId: `team-${groupId}-3`,
      played: 3,
      goalDifference: 8 - index,
      goalsFor: 10 - index,
      conductScore: index === 7 ? undefined : -index,
      points: 12 - index,
      qualifying: index === 7 || index === 8 ? null : index < 8,
      provisional: index === 7 || index === 8,
      tiebreakerUsed: index === 7 || index === 8 ? "conduct score" : undefined,
    })),
  };
}

function snapshot(matches: Match[]): TournamentSnapshot {
  return {
    generatedAt: "2026-06-14T18:00:00Z",
    sourceUpdatedAt: "2026-06-14T18:00:10Z",
    schemaVersion: "1",
    tournamentId: "world-cup-2026",
    stale: false,
    teams: GROUPS.flatMap((group) => [1, 2, 3, 4].map((position) => team(group, position))),
    matches,
    diagnostics: {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [],
      missingFields: [],
    },
  };
}

function knockout(overrides: Partial<Match> = {}): Match {
  return {
    id: "match-73-source",
    matchNumber: 73,
    round: "ROUND_OF_32",
    kickoffUtc: "2026-06-14T18:00:00Z",
    status: "SCHEDULED",
    homeTeamId: "team-A-2",
    awayTeamId: "team-B-2",
    ...overrides,
  };
}

describe("deriveTournamentStage", () => {
  it("uses the approved stage priority", () => {
    expect(deriveTournamentStage([
      knockout({ status: "FINISHED" }),
      knockout({ matchNumber: 89, round: "ROUND_OF_16", status: "SCHEDULED" }),
      knockout({ matchNumber: 97, round: "QUARTER_FINAL", status: "SECOND_HALF" }),
      knockout({ matchNumber: 101, round: "SEMI_FINAL", status: "FIRST_HALF" }),
    ]).round).toBe("SEMI_FINAL");

    expect(deriveTournamentStage([
      knockout({ status: "FINISHED" }),
      knockout({ matchNumber: 89, round: "ROUND_OF_16", status: "SCHEDULED" }),
      knockout({ matchNumber: 97, round: "QUARTER_FINAL", status: "SCHEDULED" }),
    ]).round).toBe("ROUND_OF_16");

    expect(deriveTournamentStage([
      knockout({ matchNumber: 101, round: "SEMI_FINAL", status: "FINISHED" }),
      knockout({ matchNumber: 104, round: "FINAL", status: "FINISHED" }),
    ])).toMatchObject({ round: "TOURNAMENT_COMPLETE", label: "Tournament complete" });
  });
});

describe("buildDashboardViewModel", () => {
  it("builds stable complete dashboard sections and deterministic header times", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([
        {
          id: "group-live",
          matchNumber: 1,
          round: "GROUP_STAGE",
          group: "A",
          kickoffUtc: "2026-06-14T18:00:00Z",
          status: "FIRST_HALF",
          elapsedMinutes: 12,
          homeTeamId: "team-A-1",
          awayTeamId: "team-A-2",
          normalTime: { home: 0, away: 0 },
        },
      ]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
      bracketProjection: [{
        matchNumber: 74,
        round: "ROUND_OF_32",
        homeParticipant: {
          state: "PROJECTED",
          teamId: "team-E-1",
          qualificationSource: "Projected winner of Group E",
        },
        awayParticipant: {
          state: "UNRESOLVED",
          label: "3A/B/C/D/F",
          unresolvedReason: "Annex C assignment requires definitive top-eight membership",
        },
      }],
    }, OPTIONS);

    expect(model.header).toMatchObject({
      id: "dashboard-header",
      updatedLabel: "Updated 20 seconds ago",
      live: { isLive: true, count: 1, matchIds: ["match-1"] },
      stage: { round: "GROUP_STAGE" },
    });
    expect(model.header.updatedAccessibleLabel).toContain("UTC");
    expect(model.bracket.flatMap((round) => round.matches)).toHaveLength(32);
    expect(model.groups).toHaveLength(12);
    expect(model.groups[0]).toMatchObject({ id: "group-a", live: true, liveLabel: "Live" });
    expect(model.groups[0].rows[2]).toMatchObject({
      id: "group-a-team-team-A-3",
      qualificationLabel: "Provisional: Qualifying third-place team",
      explanation: "Provisional placement; active tiebreaker: conduct score",
    });
    expect(model.groups[0].rows[3].team.flagEmoji).toBe("🏳️");
    expect(model.thirdPlace.rows).toHaveLength(12);
    expect(model.thirdPlace.rows[7]).toMatchObject({
      id: "third-place-team-team-H-3",
      conductLabel: "—",
      statusLabel: "Unresolved",
      qualificationLineAfter: true,
    });
    const projected = model.bracket[0].matches.find((match) => match.matchNumber === 74)!;
    expect(projected.home).toMatchObject({
      id: "match-74-home",
      state: "PROJECTED",
      stateLabel: "Projected",
      sourceExplanation: "Projected winner of Group E",
    });
    expect(projected.away).toMatchObject({
      state: "UNRESOLVED",
      provisional: false,
      stateLabel: "Unresolved",
      sourceExplanation: "Annex C assignment requires definitive top-eight membership",
    });
    expect(projected.away.accessibleName).toContain("Unresolved");
  });

  it("builds per-team tooltips with standing and projected R32 slot", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
      bracketProjection: [{
        matchNumber: 74,
        round: "ROUND_OF_32",
        homeParticipant: {
          state: "PROJECTED",
          teamId: "team-E-1",
          qualificationSource: "Projected winner of Group E",
        },
        awayParticipant: {
          state: "UNRESOLVED",
          label: "3A/B/C/D/F",
          unresolvedReason: "Annex C assignment requires definitive top-eight membership",
        },
      }],
    }, OPTIONS);

    // One tooltip per resolved team across all 12 groups.
    expect(model.teamTooltips).toHaveLength(48);

    const projected = model.teamTooltips.find((tooltip) => tooltip.teamId === "team-E-1")!;
    expect(projected).toMatchObject({
      groupLabel: "Group E",
      position: 1,
      positionLabel: "1st",
      recordLabel: "3-0-0",
      points: 8,
      goalsFor: 4,
      goalsAgainst: 1,
      goalDifferenceLabel: "+3",
    });
    expect(projected.projection).toMatchObject({
      determined: true,
      confirmed: false,
      statusLabel: "Projected",
      matchLabel: "M74",
      opponentLabel: "3A/B/C/D/F",
    });
    expect(projected.accessibleName).toContain("Projected Round of 32: M74 versus 3A/B/C/D/F");

    // A fourth-placed team outside qualification gets a placeholder, not a slot.
    const outside = model.teamTooltips.find((tooltip) => tooltip.teamId === "team-A-4")!;
    expect(outside.projection).toMatchObject({
      determined: false,
      placeholderLabel: "Not in the Round of 32",
    });

    // A team without a resolved slot yet still shows a pending placeholder.
    const pending = model.teamTooltips.find((tooltip) => tooltip.teamId === "team-A-1")!;
    expect(pending.projection).toMatchObject({
      determined: false,
      placeholderLabel: "Round-of-32 slot to be determined",
    });
  });

  it("renders known provisional bracket participants like other identified teams", () => {
    const ranking = thirdPlaceRanking();
    const model = buildDashboardViewModel({
      snapshot: snapshot([]),
      groupStandings: standings(),
      thirdPlaceRanking: {
        ...ranking,
        boundaryResolved: true,
        rows: ranking.rows.map((row, index) => ({
          ...row,
          qualifying: index < 8,
          provisional: row.groupId === "A",
        })),
      },
      bracketProjection: [{
        matchNumber: 74,
        round: "ROUND_OF_32",
        homeParticipant: {
          state: "UNRESOLVED",
          teamId: "team-A-1",
          provisional: true,
          unresolvedReason: "The winner of Group A is provisional",
        },
        awayParticipant: {
          state: "UNRESOLVED",
          teamId: "team-A-3",
          provisional: true,
          unresolvedReason: "The third-place qualifier from Group A is provisional",
        },
      }],
    }, OPTIONS);

    const match = model.bracket[0].matches.find((entry) => entry.matchNumber === 74)!;
    expect(match.home).toMatchObject({
      label: "Team A1",
      provisional: true,
      stateLabel: "Provisional",
      sourceExplanation: "The winner of Group A is provisional",
    });
    expect(match.home.accessibleName).toContain("provisional placement");
    expect(match.away).toMatchObject({
      label: "Team A3",
      provisional: true,
      stateLabel: "Provisional",
      sourceExplanation: "The third-place qualifier from Group A is provisional",
    });
  });

  it("keeps score phases separate and distinguishes live ahead from advancing", () => {
    const liveModel = buildDashboardViewModel({
      snapshot: snapshot([knockout({
        status: "EXTRA_TIME",
        elapsedMinutes: 113,
        normalTime: { home: 1, away: 1 },
        extraTime: { home: 1, away: 0 },
      })]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);
    const liveMatch = liveModel.bracket[0].matches[0];

    expect(liveMatch.score).toMatchObject({
      normalTime: { home: 1, away: 1 },
      extraTime: { home: 1, away: 0 },
      total: { home: 2, away: 1 },
      penalties: { home: null, away: null },
      totalLabel: "2–1",
    });
    expect(liveMatch.clockLabel).toBe("ET 113′");
    expect(liveMatch.home).toMatchObject({ currentlyAhead: true, advancing: false });

    const finalModel = buildDashboardViewModel({
      snapshot: snapshot([knockout({
        status: "FINISHED_AFTER_PENALTIES",
        normalTime: { home: 0, away: 0 },
        extraTime: { home: 0, away: 0 },
        penalties: { home: 4, away: 5 },
        winnerTeamId: "team-B-2",
      })]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);
    const finalMatch = finalModel.bracket[0].matches[0];

    expect(finalMatch.score).toMatchObject({
      total: { home: 0, away: 0 },
      totalLabel: "0–0",
      penalties: { home: 4, away: 5 },
      penaltiesLabel: "Pens 4–5",
    });
    expect(finalMatch.away).toMatchObject({ currentlyAhead: false, advancing: true });
    expect(finalMatch.accessibleName).toContain("0 to 0, Pens 4–5");

    const missingPenalties = buildDashboardViewModel({
      snapshot: snapshot([knockout({
        status: "FINISHED_AFTER_PENALTIES",
        normalTime: { home: 0, away: 0 },
      })]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS).bracket[0].matches[0];
    expect(missingPenalties.score.penaltiesLabel).toBe("Penalties unavailable");
  });

  it("shows unavailable scores and kickoff without fabricating zeroes", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);
    const match = model.bracket[0].matches[0];

    expect(match).toMatchObject({
      id: "match-73",
      kickoffUtc: null,
      kickoffLabel: "Kickoff time unavailable",
      score: {
        normalTime: { home: null, away: null },
        total: { home: null, away: null },
        totalLabel: "—",
        accessibleLabel: "score unavailable",
      },
    });
    expect(match.home.advancing).toBe(false);
    expect(match.away.advancing).toBe(false);
  });

  it("formats kickoff in the selected local timezone while retaining UTC ISO", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([knockout()]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, {
      ...OPTIONS,
      timeDisplayMode: "LOCAL",
      localTimeZone: "America/Los_Angeles",
    });
    const match = model.bracket[0].matches[0];

    expect(match.kickoffUtc).toBe("2026-06-14T18:00:00Z");
    expect(match.kickoffLabel).toContain("11:00 AM");
    expect(match.kickoffLabel).toContain("PDT");
  });

  it("writes natural-language recent event descriptions", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([
        {
          id: "group-live",
          matchNumber: 1,
          round: "GROUP_STAGE",
          group: "A",
          kickoffUtc: "2026-06-14T18:00:00Z",
          status: "SECOND_HALF",
          elapsedMinutes: 67,
          homeTeamId: "team-A-1",
          awayTeamId: "team-A-2",
          normalTime: { home: 1, away: 0 },
          events: [
            {
              id: "goal-1",
              type: "GOAL",
              teamId: "team-A-1",
              primaryPlayerName: "Alex Morgan",
              scoreValue: 1,
              clockSeconds: 720,
              clockDisplay: "12′",
            },
            {
              id: "red-1",
              type: "RED_CARD",
              teamId: "team-A-2",
              primaryPlayerName: "Sam Player",
              clockSeconds: 3900,
              clockDisplay: "65′",
            },
          ],
        },
      ]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);

    expect(model.eventLog.entries.find((entry) => entry.id === "event-log-1-goal-1-GOAL"))
      .toMatchObject({
        description: "Alex Morgan of 🏳️ Team A1 scores a goal. Score: 1–0.",
      });
    expect(model.eventLog.entries.find((entry) => entry.id === "event-log-1-red-1-RED_CARD"))
      .toMatchObject({
        description: "Sam Player of 🏳️ Team A2 receives a red card.",
      });
  });

  it("attributes own goals to the opposing player team in recent events", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([
        {
          id: "group-live",
          matchNumber: 1,
          round: "GROUP_STAGE",
          group: "A",
          kickoffUtc: "2026-06-14T18:00:00Z",
          status: "SECOND_HALF",
          elapsedMinutes: 67,
          homeTeamId: "team-A-1",
          awayTeamId: "team-A-2",
          normalTime: { home: 1, away: 0 },
          events: [
            {
              id: "own-goal-1",
              type: "OWN_GOAL",
              teamId: "team-A-1",
              primaryPlayerName: "Sam Player",
              clockSeconds: 900,
              clockDisplay: "15′",
            },
          ],
        },
      ]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);

    expect(model.eventLog.entries.find((entry) => entry.id === "event-log-1-own-goal-1-OWN_GOAL"))
      .toMatchObject({
        description: "Sam Player of 🏳️ Team A2 scores an own goal. Score: 1–0.",
      });
  });

  it("shows the running scoreline for scoring events", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([
        {
          id: "group-live",
          matchNumber: 1,
          round: "GROUP_STAGE",
          group: "A",
          kickoffUtc: "2026-06-14T18:00:00Z",
          status: "SECOND_HALF",
          elapsedMinutes: 67,
          homeTeamId: "team-A-1",
          awayTeamId: "team-A-2",
          normalTime: { home: 2, away: 1 },
          events: [
            {
              id: "goal-1",
              type: "GOAL",
              teamId: "team-A-1",
              primaryPlayerName: "Player 1",
              clockSeconds: 300,
              clockDisplay: "5′",
            },
            {
              id: "goal-2",
              type: "GOAL",
              teamId: "team-A-2",
              primaryPlayerName: "Player 2",
              clockSeconds: 1500,
              clockDisplay: "25′",
            },
            {
              id: "goal-3",
              type: "PENALTY_GOAL",
              teamId: "team-A-1",
              primaryPlayerName: "Player 3",
              clockSeconds: 3600,
              clockDisplay: "60′",
            },
          ],
        },
      ]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);

    expect(model.eventLog.entries.find((entry) => entry.id === "event-log-1-goal-1-GOAL"))
      .toMatchObject({
        description: "Player 1 of 🏳️ Team A1 scores a goal. Score: 1–0.",
      });
    expect(model.eventLog.entries.find((entry) => entry.id === "event-log-1-goal-2-GOAL"))
      .toMatchObject({
        description: "Player 2 of 🏳️ Team A2 scores a goal. Score: 1–1.",
      });
    expect(model.eventLog.entries.find((entry) => entry.id === "event-log-1-goal-3-PENALTY_GOAL"))
      .toMatchObject({
        description: "Player 3 of 🏳️ Team A1 scores a penalty. Score: 2–1.",
      });
  });

  it("orders half-time and full-time after stoppage-time events", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([
        {
          id: "match-1",
          matchNumber: 1,
          round: "GROUP_STAGE",
          group: "A",
          kickoffUtc: "2026-06-14T18:00:00Z",
          status: "FINISHED",
          homeTeamId: "team-A-1",
          awayTeamId: "team-A-2",
          normalTime: { home: 2, away: 1 },
          events: [
            {
              id: "first-half-stoppage",
              type: "YELLOW_CARD",
              teamId: "team-A-1",
              clockSeconds: 47 * 60,
              clockDisplay: "45′+2",
            },
            {
              id: "second-half-stoppage",
              type: "GOAL",
              teamId: "team-A-2",
              clockSeconds: 93 * 60,
              clockDisplay: "90′+3",
            },
          ],
        },
      ]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);

    const entryIds = model.eventLog.entries.map((entry) => entry.id);
    expect(entryIds.indexOf("event-log-1-halftime")).toBeLessThan(
      entryIds.indexOf("event-log-1-first-half-stoppage-YELLOW_CARD"),
    );
    expect(entryIds.indexOf("event-log-1-fulltime")).toBeLessThan(
      entryIds.indexOf("event-log-1-second-half-stoppage-GOAL"),
    );
  });

  it("orders full-time after extra-time stoppage events", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([
        {
          id: "match-1",
          matchNumber: 1,
          round: "ROUND_OF_16",
          kickoffUtc: "2026-06-14T18:00:00Z",
          status: "FINISHED_AFTER_EXTRA_TIME",
          homeTeamId: "team-A-1",
          awayTeamId: "team-A-2",
          normalTime: { home: 1, away: 1 },
          extraTime: { home: 1, away: 0 },
          winnerTeamId: "team-A-1",
          events: [
            {
              id: "et-stoppage-goal",
              type: "GOAL",
              teamId: "team-A-1",
              clockSeconds: 121 * 60,
              clockDisplay: "120′+1",
              primaryPlayerName: "Alex Morgan",
            },
          ],
        },
      ]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);

    const entryIds = model.eventLog.entries.map((entry) => entry.id);
    expect(entryIds.indexOf("event-log-1-fulltime")).toBeLessThan(
      entryIds.indexOf("event-log-1-et-stoppage-goal-GOAL"),
    );
  });

  it("retains the full known event history without truncating older entries", () => {
    const model = buildDashboardViewModel({
      snapshot: snapshot([
        {
          id: "match-1",
          matchNumber: 1,
          round: "GROUP_STAGE",
          group: "A",
          kickoffUtc: "2026-06-14T18:00:00Z",
          status: "FINISHED",
          homeTeamId: "team-A-1",
          awayTeamId: "team-A-2",
          normalTime: { home: 16, away: 15 },
          events: Array.from({ length: 31 }, (_, index) => ({
            id: `goal-${index + 1}`,
            type: "GOAL" as const,
            teamId: index % 2 === 0 ? "team-A-1" : "team-A-2",
            primaryPlayerName: `Player ${index + 1}`,
            clockSeconds: (index + 1) * 60,
            clockDisplay: `${index + 1}′`,
          })),
        },
      ]),
      groupStandings: standings(),
      thirdPlaceRanking: thirdPlaceRanking(),
    }, OPTIONS);

    expect(model.eventLog.entries).toHaveLength(34);
    expect(model.eventLog.entries[model.eventLog.entries.length - 1]?.id).toBe("event-log-1-kickoff");
  });
});
