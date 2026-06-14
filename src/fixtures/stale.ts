/**
 * Stale-data fixture scenario:
 *   - cached-stale: snapshot where stale: true and generatedAt is old
 */
import type { TournamentSnapshot } from "../domain";

/**
 * cached-stale — a snapshot marked stale because the upstream ESPN source
 * has not been reachable and the app is serving cached data from 2 hours ago.
 * The UI should display a staleness warning to the user.
 */
export const cachedStale: TournamentSnapshot = {
  // generatedAt reflects when this snapshot was generated — intentionally old
  generatedAt: "2026-06-14T08:00:00Z",
  // sourceUpdatedAt is the timestamp ESPN last reported, also old
  sourceUpdatedAt: "2026-06-14T07:55:00Z",
  schemaVersion: "1",
  tournamentId: "fifa.world.2026",
  stale: true,
  teams: [
    { id: "usa", fifaCode: "USA", name: "United States", shortName: "USA", group: "A" as const, flagUrl: "https://cdn.example.com/flags/usa.svg" },
    { id: "mex", fifaCode: "MEX", name: "Mexico", shortName: "MEX", group: "A" as const, flagUrl: "https://cdn.example.com/flags/mex.svg" },
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
    // Warn that this is cached/stale data
    warnings: ["ESPN source unreachable; serving cached data from 2026-06-14T08:00:00Z"],
    unresolvedTiebreakers: [],
    missingFields: [],
  },
};
