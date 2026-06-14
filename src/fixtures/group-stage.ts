/**
 * Group-stage fixture scenarios:
 *   - scheduled: all group matches scheduled, no scores
 *   - no-live-matches: a matchday with all matches SCHEDULED or FINISHED, no live action
 *   - zero-score: a live 0-0 match (distinguishes null from 0)
 *   - group-third-place-boundary: third-place rankings near the boundary
 */
import type { TournamentSnapshot } from "../domain";

const BASE_DIAGNOSTICS = {
  provider: "espn" as const,
  warnings: [],
  unresolvedTiebreakers: [],
  missingFields: [],
};

// Representative teams across three groups for these fixtures
const TEAMS_GROUP_STAGE = [
  { id: "usa", fifaCode: "USA", name: "United States", shortName: "USA", group: "A" as const, flagUrl: "https://cdn.example.com/flags/usa.svg" },
  { id: "mex", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "A" as const, flagUrl: "https://cdn.example.com/flags/mex.svg" },
  { id: "can", fifaCode: "CAN", name: "Canada", shortName: "CAN", group: "A" as const, flagUrl: "https://cdn.example.com/flags/can.svg" },
  { id: "hon", fifaCode: "HON", name: "Honduras", shortName: "HON", group: "A" as const, flagUrl: "https://cdn.example.com/flags/hon.svg" },
  { id: "esp", fifaCode: "ESP", name: "Spain", shortName: "ESP", group: "B" as const, flagUrl: "https://cdn.example.com/flags/esp.svg" },
  { id: "mar", fifaCode: "MAR", name: "Morocco", shortName: "MAR", group: "B" as const, flagUrl: "https://cdn.example.com/flags/mar.svg" },
  { id: "bra", fifaCode: "BRA", name: "Brazil", shortName: "BRA", group: "C" as const, flagUrl: "https://cdn.example.com/flags/bra.svg" },
  { id: "arg", fifaCode: "ARG", name: "Argentina", shortName: "ARG", group: "C" as const, flagUrl: "https://cdn.example.com/flags/arg.svg" },
];

/**
 * scheduled — all group matches scheduled, no scores, no live matches.
 */
export const scheduled: TournamentSnapshot = {
  generatedAt: "2026-06-14T10:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: TEAMS_GROUP_STAGE,
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
    {
      id: "m2",
      matchNumber: 2,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-14T21:00:00Z",
      venue: "Estadio Azteca",
      city: "Mexico City",
      status: "SCHEDULED",
      homeTeamId: "can",
      awayTeamId: "hon",
    },
    {
      id: "m3",
      matchNumber: 3,
      round: "GROUP_STAGE",
      group: "B",
      kickoffUtc: "2026-06-15T18:00:00Z",
      venue: "MetLife Stadium",
      city: "East Rutherford",
      status: "SCHEDULED",
      homeTeamId: "esp",
      awayTeamId: "mar",
    },
    {
      id: "m4",
      matchNumber: 4,
      round: "GROUP_STAGE",
      group: "C",
      kickoffUtc: "2026-06-15T21:00:00Z",
      venue: "Allegiant Stadium",
      city: "Las Vegas",
      status: "SCHEDULED",
      homeTeamId: "bra",
      awayTeamId: "arg",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * no-live-matches — a matchday where all matches are either SCHEDULED or FINISHED,
 * with no in-progress action.
 */
export const noLiveMatches: TournamentSnapshot = {
  generatedAt: "2026-06-14T23:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: TEAMS_GROUP_STAGE,
  matches: [
    {
      id: "m1",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-14T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "FINISHED",
      homeTeamId: "usa",
      awayTeamId: "mex",
      normalTime: { home: 2, away: 1 },
      winnerTeamId: "usa",
      updatedAt: "2026-06-14T19:55:00Z",
    },
    {
      id: "m2",
      matchNumber: 2,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-14T21:00:00Z",
      venue: "Estadio Azteca",
      city: "Mexico City",
      status: "SCHEDULED",
      homeTeamId: "can",
      awayTeamId: "hon",
    },
    {
      id: "m3",
      matchNumber: 3,
      round: "GROUP_STAGE",
      group: "B",
      kickoffUtc: "2026-06-14T20:00:00Z",
      venue: "MetLife Stadium",
      city: "East Rutherford",
      status: "FINISHED",
      homeTeamId: "esp",
      awayTeamId: "mar",
      normalTime: { home: 1, away: 0 },
      winnerTeamId: "esp",
      updatedAt: "2026-06-14T21:55:00Z",
    },
    {
      id: "m4",
      matchNumber: 4,
      round: "GROUP_STAGE",
      group: "C",
      kickoffUtc: "2026-06-15T00:00:00Z",
      venue: "Allegiant Stadium",
      city: "Las Vegas",
      status: "SCHEDULED",
      homeTeamId: "bra",
      awayTeamId: "arg",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * zero-score — a live 0-0 match. Scores are integer 0, NOT null.
 * This distinguishes an active scoreless match from a not-yet-played scheduled match.
 * Compare: m1 has normalTime: { home: 0, away: 0 } (playing); m2 has no normalTime (scheduled).
 */
export const zeroScore: TournamentSnapshot = {
  generatedAt: "2026-06-14T18:30:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: TEAMS_GROUP_STAGE,
  matches: [
    {
      id: "m1",
      matchNumber: 1,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-14T18:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "FIRST_HALF",
      elapsedMinutes: 28,
      homeTeamId: "usa",
      awayTeamId: "mex",
      // Integer 0 = real score; null would mean score unknown/not started
      normalTime: { home: 0, away: 0 },
      updatedAt: "2026-06-14T18:28:00Z",
    },
    {
      id: "m2",
      matchNumber: 2,
      round: "GROUP_STAGE",
      group: "A",
      kickoffUtc: "2026-06-14T21:00:00Z",
      venue: "Estadio Azteca",
      city: "Mexico City",
      // No normalTime at all — this match hasn't started yet
      status: "SCHEDULED",
      homeTeamId: "can",
      awayTeamId: "hon",
    },
  ],
  diagnostics: BASE_DIAGNOSTICS,
};

/**
 * group-third-place-boundary — third-place rankings where teams cluster near the
 * boundary between the qualifying top 8 and non-qualifying spots.
 * WC2026 has 12 groups; the best 8 third-place teams advance to Round of 32.
 * Two teams at ranks 7/8 are separated only by conduct score, which is unavailable.
 */
export const groupThirdPlaceBoundary: TournamentSnapshot = {
  generatedAt: "2026-06-26T22:00:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: false,
  teams: [
    { id: "t-a3", fifaCode: "HON", name: "Honduras", shortName: "HON", group: "A" as const, flagUrl: "https://cdn.example.com/flags/hon.svg" },
    { id: "t-b3", fifaCode: "MAR", name: "Morocco", shortName: "MAR", group: "B" as const, flagUrl: "https://cdn.example.com/flags/mar.svg" },
    { id: "t-c3", fifaCode: "PER", name: "Peru", shortName: "PER", group: "C" as const, flagUrl: "https://cdn.example.com/flags/per.svg" },
    { id: "t-d3", fifaCode: "KOR", name: "South Korea", shortName: "KOR", group: "D" as const, flagUrl: "https://cdn.example.com/flags/kor.svg" },
    { id: "t-e3", fifaCode: "TUN", name: "Tunisia", shortName: "TUN", group: "E" as const, flagUrl: "https://cdn.example.com/flags/tun.svg" },
    { id: "t-f3", fifaCode: "NGA", name: "Nigeria", shortName: "NGA", group: "F" as const, flagUrl: "https://cdn.example.com/flags/nga.svg" },
    { id: "t-g3", fifaCode: "AUS", name: "Australia", shortName: "AUS", group: "G" as const, flagUrl: "https://cdn.example.com/flags/aus.svg" },
    { id: "t-h3", fifaCode: "GHA", name: "Ghana", shortName: "GHA", group: "H" as const, flagUrl: "https://cdn.example.com/flags/gha.svg" },
    { id: "t-i3", fifaCode: "SEN", name: "Senegal", shortName: "SEN", group: "I" as const, flagUrl: "https://cdn.example.com/flags/sen.svg" },
    { id: "t-j3", fifaCode: "URU", name: "Uruguay", shortName: "URU", group: "J" as const, flagUrl: "https://cdn.example.com/flags/uru.svg" },
    { id: "t-k3", fifaCode: "EGY", name: "Egypt", shortName: "EGY", group: "K" as const, flagUrl: "https://cdn.example.com/flags/egy.svg" },
    { id: "t-l3", fifaCode: "IRN", name: "Iran", shortName: "IRN", group: "L" as const, flagUrl: "https://cdn.example.com/flags/irn.svg" },
  ],
  matches: [],
  diagnostics: {
    provider: "espn",
    warnings: ["Third-place ranking near boundary — conduct scores unavailable for groups G, H"],
    unresolvedTiebreakers: [
      {
        // Cross-group tiebreaker between teams at 7th/8th in the third-place table
        teamIds: ["t-g3", "t-h3"],
        criterion: "conduct_score",
      },
    ],
    missingFields: ["conductScore"],
  },
};
