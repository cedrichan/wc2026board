import type { GroupId } from "./common";

export interface FifaRankingEntry {
  // Internal identifier; matches Team.id
  teamId: string;
  // 3-letter FIFA country code; used as display fallback when name is unavailable
  fifaCode: string;
  // Numeric rank; lower is better (1 = top-ranked)
  rank: number;
}

export interface FifaRankingEdition {
  // Edition identifier, e.g. "2026-04" for the April 2026 publication
  editionId: string;
  // ISO 8601 date when FIFA published this edition
  publishedDate: string;
  // All ranked teams ordered by rank ascending (rank 1 first)
  entries: FifaRankingEntry[];
}

export interface ThirdPlaceAssignment {
  // Alphabetically sorted group letters of the eight qualifying third-place teams
  // joined without separator, e.g. "ABCDEFGH"
  qualifyingGroups: string;
  // Maps each R32 seed slot to the group letter of the third-place team assigned to it
  slots: {
    "1A": string;
    "1B": string;
    "1D": string;
    "1E": string;
    "1G": string;
    "1I": string;
    "1K": string;
    "1L": string;
  };
}

// R32 match seeds that receive a third-place qualifier (per Annex C)
export type ThirdPlaceWinnerSlot = keyof ThirdPlaceAssignment["slots"];

export interface AssignedThirdPlaceQualifier {
  // The group where this team finished 3rd
  groupId: GroupId;
  // The team assigned to this R32 slot
  teamId: string;
  provisional: boolean;
}

export interface ResolvedThirdPlaceAssignment {
  // Same encoding as ThirdPlaceAssignment.qualifyingGroups
  qualifyingGroups: string;
  slots: Record<ThirdPlaceWinnerSlot, AssignedThirdPlaceQualifier>;
}

export type ThirdPlaceAssignmentDiagnosticCode =
  | "UNRESOLVED_QUALIFICATION_BOUNDARY"  // the 8 qualifying third-place teams are not yet determined
  | "INVALID_QUALIFIER_COUNT"            // did not find exactly 8 qualifying groups
  | "DUPLICATE_QUALIFYING_GROUP"         // same group appears more than once in qualifiers
  | "DUPLICATE_QUALIFYING_TEAM"          // same team appears more than once
  | "INVALID_QUALIFYING_GROUP"           // group letter not in the valid GroupId set
  | "MISSING_ANNEX_C_ROW"               // no Annex C table entry for the given group combination
  | "NON_UNIQUE_ANNEX_C_ROW"            // multiple Annex C rows match (data error)
  | "INVALID_ANNEX_C_ROW";              // row exists but contains malformed slot data

export interface ThirdPlaceAssignmentDiagnostic {
  code: ThirdPlaceAssignmentDiagnosticCode;
  // Human-readable explanation of the specific issue
  message: string;
}

export interface ThirdPlaceAssignmentResult {
  // Absent when the assignment cannot be computed (see diagnostics for reason)
  assignment?: ResolvedThirdPlaceAssignment;
  // Always present; non-empty when assignment is absent or partially degraded
  diagnostics: ThirdPlaceAssignmentDiagnostic[];
}
