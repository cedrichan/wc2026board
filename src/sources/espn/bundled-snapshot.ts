import bundledScoreboard from "./__fixtures__/scoreboard-range-20260611-20260719.json";
import bundledScoreboardMeta from "./__fixtures__/scoreboard-range-20260611-20260719.meta.json";
import type { PartialTeam, Team, TournamentSnapshot } from "../../domain";
import { addFixtureCoverageDiagnostics } from "./espn-scoreboard-data-source";
import { normalizeEspnScoreboards } from "./normalize";
import { mapEspnScoreboardToNormalizationInput } from "./runtime-mapper";
import { parseEspnScoreboard } from "./schema";

const SNAPSHOT_SCHEMA_VERSION = "1";
const TOURNAMENT_ID = "fifa.world.2026";

function isCompleteTeam(team: PartialTeam): team is Team {
  return (
    team.fifaCode !== undefined &&
    team.name !== undefined &&
    team.shortName !== undefined &&
    team.group !== undefined
  );
}

/**
 * Build the startup snapshot from the ESPN response captured at release time.
 * The fixed timestamp is intentional: stale-data policies must use the age of
 * the capture, not the time at which a visitor opens the app.
 */
export function createBundledEspnSnapshot(): TournamentSnapshot {
  const payload = parseEspnScoreboard(bundledScoreboard);
  const normalized = normalizeEspnScoreboards([
    mapEspnScoreboardToNormalizationInput(payload),
  ]);

  return addFixtureCoverageDiagnostics({
    generatedAt: bundledScoreboardMeta.capturedAt,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    tournamentId: TOURNAMENT_ID,
    stale: true,
    ...normalized,
    teams: normalized.teams.filter(isCompleteTeam),
  });
}
