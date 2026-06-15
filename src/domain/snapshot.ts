import type { Match } from "./match";
import type { Team } from "./team";

export interface UnresolvedTiebreaker {
  // Which group contains the tie; absent for cross-group (third-place ranking) ties
  groupId?: string;
  // IDs of the teams involved in the tie
  teamIds: string[];
  // Human-readable name of the criterion that could not be resolved
  criterion: string;
}

export interface DataDiagnostic {
  // Machine-readable error or warning category
  code: string;
  message: string;
  // JSON path into raw source data where the issue was detected
  path?: string;
  // The match the issue relates to, if applicable
  matchId?: string;
  // Specific field within the match record, if applicable
  field?: string;
}

export interface DataDiagnostics {
  // Always "espn" in production for this MVP
  provider: "espn";
  // Version string of the upstream data schema, when reported by the source
  rawSchemaVersion?: string;
  // Human-readable messages about non-fatal data quality issues
  warnings: string[];
  unresolvedTiebreakers: UnresolvedTiebreaker[];
  // Dotted paths to expected fields that were absent in source data
  missingFields: string[];
  // Machine-readable diagnostics are optional for compatibility with existing snapshots.
  issues?: DataDiagnostic[];
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
  // True when the source returned data beyond the expected refresh window
  stale: boolean;
  // All 48 teams participating in the tournament
  teams: Team[];
  // All 104 scheduled matches
  matches: Match[];
  diagnostics: DataDiagnostics;
}
