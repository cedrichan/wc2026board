/**
 * Knockout-stage fixture scenarios:
 *   - finished-normal: match FINISHED in normal time
 *   - finished-aet: FINISHED_AFTER_EXTRA_TIME
 *   - finished-pens: FINISHED_AFTER_PENALTIES with penalty scores separate from match score
 *   - knockout-advancement: finished Round-of-16 matches whose winners feed the next slot
 */
import type { TournamentSnapshot } from "../domain";

const BASE_DIAGNOSTICS = {
  provider: "espn" as const,
  warnings: [],
  unresolvedTiebreakers: [],
  missingFields: [],
};

const KNOCKOUT_TEAMS = [
  { id: "usa", fifaCode: "USA", name: "United States", shortName: "USA", group: "A" as const, flagUrl: "https://cdn.example.com/flags/usa.svg" },
  { id: "mex", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "B" as const, flagUrl: "https://cdn.example.com/flags/mex.svg" },
  { id: "esp", fifaCode: "ESP", name: "Spain", shortName: "ESP", group: "C" as const, flagUrl: "https://cdn.example.com/flags/esp.svg" },
  { id: "fra", fifaCode: "FRA", name: "France", shortName: "FRA", group: "D" as const, flagUrl: "https://cdn.example.com/flags/fra.svg" },
  { id: "bra", fifaCode: "BRA", name: "Brazil", shortName: "BRA", group: "E" as const, flagUrl: "https://cdn.example.com/flags/bra.svg" },
  { id: "arg", fifaCode: "ARG", name: "Argentina", shortName: "ARG", group: "F" as const, flagUrl: "https://cdn.example.com/flags/arg.svg" },
];

/**
 * finished-normal — knockout match FINISHED in normal time (no extra time needed).
 * Winner is clear from normalTime score.
 */
export const finishedNormal: TournamentSnapshot = {
  generatedAt: "2026-07-01T20:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: KNOCKOUT_TEAMS,
  matches: [
    {
      id: "ko1",
      matchNumber: 73,
      round: "ROUND_OF_16",
      kickoffUtc: "2026-07-01T18:00:00Z",
      venue: "AT&T Stadium",
      city: "Arlington",
      status: "FINISHED",
      homeTeamId: "usa",
      awayTeamId: "mex",
      normalTime: { home: 3, away: 1 },
      winnerTeamId: "usa",
      updatedAt: "2026-07-01T19:55:00Z",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * finished-aet — knockout match FINISHED_AFTER_EXTRA_TIME.
 * normalTime was a draw; extraTime broke the tie. No penalties.
 */
export const finishedAet: TournamentSnapshot = {
  generatedAt: "2026-07-02T22:15:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: KNOCKOUT_TEAMS,
  matches: [
    {
      id: "ko2",
      matchNumber: 74,
      round: "ROUND_OF_16",
      kickoffUtc: "2026-07-02T18:00:00Z",
      venue: "MetLife Stadium",
      city: "East Rutherford",
      status: "FINISHED_AFTER_EXTRA_TIME",
      homeTeamId: "esp",
      awayTeamId: "fra",
      // Normal time ended 1-1
      normalTime: { home: 1, away: 1 },
      // Extra time: Spain scored in the 105th minute
      extraTime: { home: 1, away: 0 },
      winnerTeamId: "esp",
      updatedAt: "2026-07-02T22:10:00Z",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * finished-pens — knockout match FINISHED_AFTER_PENALTIES.
 * normalTime and extraTime both ended level; penalty shootout decided the winner.
 * Penalty scores are on the `penalties` field — they are NOT added to normalTime.
 */
export const finishedPens: TournamentSnapshot = {
  generatedAt: "2026-07-03T22:30:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: KNOCKOUT_TEAMS,
  matches: [
    {
      id: "ko3",
      matchNumber: 75,
      round: "QUARTER_FINAL",
      kickoffUtc: "2026-07-03T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "FINISHED_AFTER_PENALTIES",
      homeTeamId: "bra",
      awayTeamId: "arg",
      // Normal time: 2-2 after 90 minutes
      normalTime: { home: 2, away: 2 },
      // Extra time: both teams level — 0-0 in the extra period
      extraTime: { home: 0, away: 0 },
      // Penalty shootout: Argentina win 4-3 on pens
      // These scores are NOT added to normalTime
      penalties: { home: 3, away: 4 },
      winnerTeamId: "arg",
      updatedAt: "2026-07-03T22:25:00Z",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * knockout-advancement — a finished Round-of-16 match where the winner (USA)
 * advances and feeds the home slot of the subsequent Quarter-final.
 * The snapshot contains both the finished R16 match and the downstream QF
 * with both participants confirmed.
 */
export const knockoutAdvancement: TournamentSnapshot = {
  generatedAt: "2026-07-05T20:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: KNOCKOUT_TEAMS,
  matches: [
    // R16 match — finished, USA won
    {
      id: "ko1",
      matchNumber: 89,
      round: "ROUND_OF_16",
      kickoffUtc: "2026-07-01T18:00:00Z",
      venue: "AT&T Stadium",
      city: "Arlington",
      status: "FINISHED",
      homeTeamId: "usa",
      awayTeamId: "mex",
      normalTime: { home: 2, away: 1 },
      winnerTeamId: "usa",
      updatedAt: "2026-07-01T19:55:00Z",
    },
    // Concurrent R16 match — also finished
    {
      id: "ko2",
      matchNumber: 90,
      round: "ROUND_OF_16",
      kickoffUtc: "2026-07-02T18:00:00Z",
      venue: "MetLife Stadium",
      city: "East Rutherford",
      status: "FINISHED",
      homeTeamId: "esp",
      awayTeamId: "fra",
      normalTime: { home: 1, away: 2 },
      winnerTeamId: "fra",
      updatedAt: "2026-07-02T19:55:00Z",
    },
    // QF fed by M89 (home) and M90 (away)
    {
      id: "qf1",
      matchNumber: 97,
      round: "QUARTER_FINAL",
      kickoffUtc: "2026-07-08T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "SCHEDULED",
      homeTeamId: "usa",
      awayTeamId: "fra",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};
