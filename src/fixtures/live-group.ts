/**
 * Live group-stage fixture scenarios:
 *   - live-group-half: at least one match in FIRST_HALF, scores changing group standings
 *   - live-group-second: SECOND_HALF, qualification positions shifting
 *   - half-time: a match at HALF_TIME
 */
import type { TournamentSnapshot } from "../domain";

const BASE_DIAGNOSTICS = {
  provider: "espn" as const,
  warnings: [],
  unresolvedTiebreakers: [],
  missingFields: [],
};

const TEAMS_LIVE = [
  { id: "usa", fifaCode: "USA", name: "United States", shortName: "USA", group: "A" as const, flagUrl: "https://cdn.example.com/flags/usa.svg" },
  { id: "mex", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "A" as const, flagUrl: "https://cdn.example.com/flags/mex.svg" },
  { id: "can", fifaCode: "CAN", name: "Canada", shortName: "CAN", group: "A" as const, flagUrl: "https://cdn.example.com/flags/can.svg" },
  { id: "hon", fifaCode: "HON", name: "Honduras", shortName: "HON", group: "A" as const, flagUrl: "https://cdn.example.com/flags/hon.svg" },
  { id: "esp", fifaCode: "ESP", name: "Spain", shortName: "ESP", group: "B" as const, flagUrl: "https://cdn.example.com/flags/esp.svg" },
  { id: "mar", fifaCode: "MAR", name: "Morocco", shortName: "MAR", group: "B" as const, flagUrl: "https://cdn.example.com/flags/mar.svg" },
];

/**
 * live-group-half — at least one match in FIRST_HALF with scores that are
 * changing group standings. Another match is still scheduled.
 */
export const liveGroupHalf: TournamentSnapshot = {
  generatedAt: "2026-06-18T18:35:00Z",
  sourceUpdatedAt: "2026-06-18T18:34:30Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: TEAMS_LIVE,
  matches: [
    {
      id: "m1",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-18T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "FIRST_HALF",
      elapsedMinutes: 35,
      homeTeamId: "usa",
      awayTeamId: "mex",
      normalTime: { home: 1, away: 0 },
      updatedAt: "2026-06-18T18:34:00Z",
      disciplinaryEvents: [
        {
          teamId: "mex",
          playerName: "G. Ochoa",
          cardType: "YELLOW",
          minute: 22,
        },
      ],
    },
    {
      id: "m2",
      matchNumber: 2,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-18T21:00:00Z",
      venue: "Estadio Azteca",
      city: "Mexico City",
      status: "SCHEDULED",
      homeTeamId: "can",
      awayTeamId: "hon",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * live-group-second — SECOND_HALF in progress, with the current scoreline
 * causing qualification positions to shift relative to earlier results.
 * A team that was 3rd is now pushing into 2nd with a goal in the 68th minute.
 */
export const liveGroupSecond: TournamentSnapshot = {
  generatedAt: "2026-06-22T20:10:00Z",
  sourceUpdatedAt: "2026-06-22T20:09:45Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: TEAMS_LIVE,
  matches: [
    // Earlier finished match — USA leads group on 6 pts
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
      normalTime: { home: 2, away: 0 },
      winnerTeamId: "usa",
      updatedAt: "2026-06-18T19:55:00Z",
    },
    // Earlier finished match — Canada 2nd on 3 pts, Honduras 3rd on 0 pts
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
      normalTime: { home: 1, away: 0 },
      winnerTeamId: "can",
      updatedAt: "2026-06-18T22:55:00Z",
    },
    // LIVE: Honduras vs Mexico — a Honduras goal in 68' would move them above MEX
    {
      id: "m5",
      matchNumber: 5,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-22T18:00:00Z",
      venue: "AT&T Stadium",
      city: "Arlington",
      status: "SECOND_HALF",
      elapsedMinutes: 68,
      homeTeamId: "hon",
      awayTeamId: "mex",
      normalTime: { home: 1, away: 0 },
      updatedAt: "2026-06-22T20:08:00Z",
    },
    // Concurrent match
    {
      id: "m6",
      matchNumber: 6,
      round: "GROUP_STAGE",
      group: "B",
      kickoffUtc: "2026-06-22T18:00:00Z",
      venue: "MetLife Stadium",
      city: "East Rutherford",
      status: "SECOND_HALF",
      elapsedMinutes: 68,
      homeTeamId: "esp",
      awayTeamId: "mar",
      normalTime: { home: 2, away: 1 },
      updatedAt: "2026-06-22T20:08:00Z",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * half-time — a match currently at HALF_TIME. No elapsed minutes
 * (the interval is not timed), normalTime score reflects the first 45 minutes.
 */
export const halfTime: TournamentSnapshot = {
  generatedAt: "2026-06-18T18:48:00Z",
  sourceUpdatedAt: "2026-06-18T18:47:30Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: TEAMS_LIVE,
  matches: [
    {
      id: "m1",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-18T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "HALF_TIME",
      homeTeamId: "usa",
      awayTeamId: "mex",
      // Score at the whistle; no elapsedMinutes during the break
      normalTime: { home: 1, away: 1 },
      updatedAt: "2026-06-18T18:47:00Z",
    },
    {
      id: "m2",
      matchNumber: 2,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-18T21:00:00Z",
      venue: "Estadio Azteca",
      city: "Mexico City",
      status: "SCHEDULED",
      homeTeamId: "can",
      awayTeamId: "hon",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};
