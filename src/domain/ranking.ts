import type { GroupId } from "./common";

export interface FifaRankingEntry {
  teamId: string;
  fifaCode: string;
  rank: number;
}

export interface FifaRankingEdition {
  // Edition identifier, e.g. "2026-04"
  editionId: string;
  publishedDate: string;
  entries: FifaRankingEntry[];
}

export interface ThirdPlaceAssignment {
  // Alphabetically sorted group letters of the eight qualifying third-place teams
  // joined without separator, e.g. "ABCDEFGH"
  qualifyingGroups: string;
  // Maps each group-winner slot to the third-place team's group letter
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

export type ThirdPlaceWinnerSlot = keyof ThirdPlaceAssignment["slots"];

export interface AssignedThirdPlaceQualifier {
  groupId: GroupId;
  teamId: string;
}

export interface ResolvedThirdPlaceAssignment {
  qualifyingGroups: string;
  slots: Record<ThirdPlaceWinnerSlot, AssignedThirdPlaceQualifier>;
}

export type ThirdPlaceAssignmentDiagnosticCode =
  | "UNRESOLVED_QUALIFICATION_BOUNDARY"
  | "INVALID_QUALIFIER_COUNT"
  | "DUPLICATE_QUALIFYING_GROUP"
  | "DUPLICATE_QUALIFYING_TEAM"
  | "INVALID_QUALIFYING_GROUP"
  | "MISSING_ANNEX_C_ROW"
  | "NON_UNIQUE_ANNEX_C_ROW"
  | "INVALID_ANNEX_C_ROW";

export interface ThirdPlaceAssignmentDiagnostic {
  code: ThirdPlaceAssignmentDiagnosticCode;
  message: string;
}

export interface ThirdPlaceAssignmentResult {
  assignment?: ResolvedThirdPlaceAssignment;
  diagnostics: ThirdPlaceAssignmentDiagnostic[];
}
