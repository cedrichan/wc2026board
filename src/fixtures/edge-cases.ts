/**
 * Edge-case fixture scenarios:
 *   - extra-time: knockout match in EXTRA_TIME
 *   - extra-time-break: EXTRA_TIME_BREAK
 *   - penalty-shootout: PENALTY_SHOOTOUT in progress with partial shootout scores
 *   - postponed: a match with POSTPONED status
 *   - suspended: SUSPENDED
 *   - cancelled: CANCELLED
 *   - unknown-status: UNKNOWN status
 *   - missing-flags: some teams missing flagUrl
 *   - missing-venue: some matches missing venue/city
 *   - incomplete-conduct: UnresolvedTiebreaker in diagnostics, provisional: true on StandingRow
 */
import type { TournamentSnapshot } from "../domain";

const BASE_DIAGNOSTICS = {
  provider: "espn" as const,
  warnings: [],
  unresolvedTiebreakers: [],
  missingFields: [],
};

const EDGE_TEAMS = [
  { id: "usa", fifaCode: "USA", name: "United States", shortName: "USA", group: "A" as const, flagUrl: "https://cdn.example.com/flags/usa.svg" },
  { id: "mex", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "B" as const, flagUrl: "https://cdn.example.com/flags/mex.svg" },
  { id: "esp", fifaCode: "ESP", name: "Spain", shortName: "ESP", group: "C" as const, flagUrl: "https://cdn.example.com/flags/esp.svg" },
  { id: "fra", fifaCode: "FRA", name: "France", shortName: "FRA", group: "D" as const, flagUrl: "https://cdn.example.com/flags/fra.svg" },
];

/**
 * extra-time — knockout match currently in EXTRA_TIME.
 * Normal time ended level; extra time is underway with both teams scoring.
 */
export const extraTime: TournamentSnapshot = {
  generatedAt: "2026-07-03T20:10:00Z",
  sourceUpdatedAt: "2026-07-03T20:09:45Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "ko1",
      matchNumber: 73,
      round: "ROUND_OF_16",
      kickoffUtc: "2026-07-03T18:00:00Z",
      venue: "AT&T Stadium",
      city: "Arlington",
      status: "EXTRA_TIME",
      elapsedMinutes: 98,
      homeTeamId: "usa",
      awayTeamId: "mex",
      normalTime: { home: 1, away: 1 },
      extraTime: { home: 0, away: 0 },
      updatedAt: "2026-07-03T20:09:00Z",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * extra-time-break — knockout match at EXTRA_TIME_BREAK (between the two ET periods).
 * No elapsedMinutes during the interval.
 */
export const extraTimeBreak: TournamentSnapshot = {
  generatedAt: "2026-07-03T20:22:00Z",
  sourceUpdatedAt: "2026-07-03T20:21:30Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "ko1",
      matchNumber: 73,
      round: "ROUND_OF_16",
      kickoffUtc: "2026-07-03T18:00:00Z",
      venue: "AT&T Stadium",
      city: "Arlington",
      status: "EXTRA_TIME_BREAK",
      homeTeamId: "usa",
      awayTeamId: "mex",
      normalTime: { home: 1, away: 1 },
      // First ET period ended 0-0; break before second ET half
      extraTime: { home: 0, away: 0 },
      updatedAt: "2026-07-03T20:21:00Z",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * penalty-shootout — PENALTY_SHOOTOUT in progress.
 * Partial penalties taken (not all kicks completed); penalty scores are NOT
 * added to normalTime or extraTime. The `penalties` field tracks shootout progress.
 */
export const penaltyShootout: TournamentSnapshot = {
  generatedAt: "2026-07-03T20:40:00Z",
  sourceUpdatedAt: "2026-07-03T20:39:45Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "ko1",
      matchNumber: 73,
      round: "ROUND_OF_16",
      kickoffUtc: "2026-07-03T18:00:00Z",
      venue: "AT&T Stadium",
      city: "Arlington",
      status: "PENALTY_SHOOTOUT",
      homeTeamId: "usa",
      awayTeamId: "mex",
      // Match tied after normal time and extra time
      normalTime: { home: 1, away: 1 },
      extraTime: { home: 0, away: 0 },
      // Partial shootout: 3 kicks each taken so far (2-3 after round 3)
      // This is NOT added to normalTime — penalty scores are tracked separately
      penalties: { home: 2, away: 3 },
      updatedAt: "2026-07-03T20:39:00Z",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * postponed — a match with POSTPONED status (e.g., weather or pitch issue).
 */
export const postponed: TournamentSnapshot = {
  generatedAt: "2026-06-20T19:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "m5",
      matchNumber: 5,
      round: "GROUP_STAGE",
      group: "A" as const,
      kickoffUtc: "2026-06-20T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "POSTPONED",
      homeTeamId: "usa",
      awayTeamId: "mex",
      updatedAt: "2026-06-20T17:30:00Z",
    },
  ],
  diagnostics: {
    provider: "espn",
    warnings: ["Match m5 postponed — reason not provided by source"],
    unresolvedTiebreakers: [],
    missingFields: [],
  },
};

/**
 * suspended — a match suspended mid-game (e.g., crowd trouble, floodlight failure).
 */
export const suspended: TournamentSnapshot = {
  generatedAt: "2026-06-20T19:10:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "m5",
      matchNumber: 5,
      round: "GROUP_STAGE",
      group: "A" as const,
      kickoffUtc: "2026-06-20T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "SUSPENDED",
      elapsedMinutes: 67,
      homeTeamId: "usa",
      awayTeamId: "mex",
      // Score at the point of suspension
      normalTime: { home: 1, away: 2 },
      updatedAt: "2026-06-20T19:08:00Z",
    },
  ],
  diagnostics: {
    provider: "espn",
    warnings: ["Match m5 suspended at 67' — awaiting official statement"],
    unresolvedTiebreakers: [],
    missingFields: [],
  },
};

/**
 * cancelled — a match with CANCELLED status.
 */
export const cancelled: TournamentSnapshot = {
  generatedAt: "2026-06-20T08:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "m5",
      matchNumber: 5,
      round: "GROUP_STAGE",
      group: "A" as const,
      kickoffUtc: "2026-06-20T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "CANCELLED",
      homeTeamId: "usa",
      awayTeamId: "mex",
      updatedAt: "2026-06-20T07:45:00Z",
    },
  ],
  diagnostics: {
    provider: "espn",
    warnings: ["Match m5 cancelled"],
    unresolvedTiebreakers: [],
    missingFields: [],
  },
};

/**
 * unknown-status — a match with UNKNOWN status (ESPN returned an unrecognised state).
 */
export const unknownStatus: TournamentSnapshot = {
  generatedAt: "2026-06-20T18:10:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "m5",
      matchNumber: 5,
      round: "GROUP_STAGE",
      group: "A" as const,
      kickoffUtc: "2026-06-20T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "UNKNOWN",
      homeTeamId: "usa",
      awayTeamId: "mex",
      updatedAt: "2026-06-20T18:05:00Z",
    },
  ],
  diagnostics: {
    provider: "espn",
    warnings: ["Match m5 has unrecognised status from ESPN; mapped to UNKNOWN"],
    unresolvedTiebreakers: [],
    missingFields: ["status"],
  },
};

/**
 * missing-flags — some teams have no flagUrl. The UI must handle missing flags gracefully.
 */
export const missingFlags: TournamentSnapshot = {
  generatedAt: "2026-06-14T10:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: [
    // flagUrl present
    { id: "usa", fifaCode: "USA", name: "United States", shortName: "USA", group: "A" as const, flagUrl: "https://cdn.example.com/flags/usa.svg" },
    // flagUrl absent
    { id: "mex", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "A" as const },
    { id: "esp", fifaCode: "ESP", name: "Spain", shortName: "ESP", group: "B" as const, flagUrl: "https://cdn.example.com/flags/esp.svg" },
    // flagUrl absent
    { id: "fra", fifaCode: "FRA", name: "France", shortName: "FRA", group: "B" as const },
  ],
  matches: [
    {
      id: "m1",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-14T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "SCHEDULED",
      homeTeamId: "usa",
      awayTeamId: "mex",
    },
  ],
  diagnostics: {
    provider: "espn",
    warnings: [],
    unresolvedTiebreakers: [],
    missingFields: ["teams[mex].flagUrl", "teams[fra].flagUrl"],
  },
};

/**
 * missing-venue — some matches missing venue and/or city.
 */
export const missingVenue: TournamentSnapshot = {
  generatedAt: "2026-06-14T10:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: EDGE_TEAMS,
  matches: [
    {
      id: "m1",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A" as const,
      kickoffUtc: "2026-06-14T18:00:00Z",
      // venue and city are present
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "SCHEDULED",
      homeTeamId: "usa",
      awayTeamId: "mex",
    },
    {
      id: "m2",
      matchNumber: 2,
      round: "GROUP_STAGE",
      group: "B" as const,
      kickoffUtc: "2026-06-14T21:00:00Z",
      // venue and city are absent — ESPN did not provide them
      status: "SCHEDULED",
      homeTeamId: "esp",
      awayTeamId: "fra",
    },
  ],
  diagnostics: {
    provider: "espn",
    warnings: [],
    unresolvedTiebreakers: [],
    missingFields: ["matches[m2].venue", "matches[m2].city"],
  },
};

/**
 * incomplete-conduct — at least one UnresolvedTiebreaker in diagnostics because
 * conduct scores are unavailable; affected standings rows carry provisional: true.
 */
export const incompleteConductFixture: TournamentSnapshot = {
  generatedAt: "2026-06-24T22:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: [
    { id: "usa", fifaCode: "USA", name: "United States", shortName: "USA", group: "A" as const, flagUrl: "https://cdn.example.com/flags/usa.svg" },
    { id: "mex", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "A" as const, flagUrl: "https://cdn.example.com/flags/mex.svg" },
    { id: "can", fifaCode: "CAN", name: "Canada", shortName: "CAN", group: "A" as const, flagUrl: "https://cdn.example.com/flags/can.svg" },
    { id: "hon", fifaCode: "HON", name: "Honduras", shortName: "HON", group: "A" as const, flagUrl: "https://cdn.example.com/flags/hon.svg" },
  ],
  matches: [
    {
      id: "m1",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-18T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "FINISHED",
      homeTeamId: "usa",
      awayTeamId: "mex",
      normalTime: { home: 1, away: 1 },
      updatedAt: "2026-06-18T19:55:00Z",
    },
    {
      id: "m2",
      matchNumber: 2,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-18T21:00:00Z",
      venue: "Estadio Azteca",
      city: "Mexico City",
      status: "FINISHED",
      homeTeamId: "can",
      awayTeamId: "hon",
      normalTime: { home: 1, away: 1 },
      updatedAt: "2026-06-18T22:55:00Z",
    },
  ],
  diagnostics: {
    provider: "espn",
    warnings: [
      "Conduct scores unavailable for group A; tiebreaker between USA and MEX cannot be resolved",
    ],
    unresolvedTiebreakers: [
      {
        groupId: "A",
        teamIds: ["usa", "mex"],
        criterion: "conduct_score",
      },
    ],
    missingFields: ["disciplinaryEvents"],
  },
};
