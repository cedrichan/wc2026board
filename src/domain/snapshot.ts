import type { Match } from "./match";
import type { Team } from "./team";

export interface UnresolvedTiebreaker {
  // Which group contains the tie; absent for cross-group (third-place ranking) ties
  groupId?: string;
  teamIds: string[];
  // Human-readable name of the criterion that could not be resolved
  criterion: string;
}

export interface DataDiagnostics {
  // Always "espn" in production for this MVP
  provider: "espn";
  rawSchemaVersion?: string;
  warnings: string[];
  unresolvedTiebreakers: UnresolvedTiebreaker[];
  missingFields: string[];
}

export interface TournamentSnapshot {
  // ISO 8601 timestamp when this snapshot was normalized
  generatedAt: string;
  // ISO 8601 timestamp reported by the upstream source, when available
  sourceUpdatedAt?: string;
  // Opaque version string; incompatible versions must be discarded from cache
  schemaVersion: string;
  // Identifies the tournament; snapshots from a different tournament must be discarded
  tournamentId: string;
  stale: boolean;
  teams: Team[];
  matches: Match[];
  diagnostics: DataDiagnostics;
}
