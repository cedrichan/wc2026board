import type { GroupId } from "./common";

export type QualificationStatus =
  | "DIRECT"              // 1st or 2nd in group; advances automatically
  | "THIRD_PLACE_QUALIFIER" // 3rd in group; may advance via the cross-group third-place ranking
  | "OUTSIDE"             // 4th in group; eliminated
  | "UNRESOLVED";         // cannot determine status without more match results

export interface StandingRow {
  teamId: string;
  // 1–4 within the group
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  // FIFA fair-play score used as a late tiebreaker; undefined means data unavailable; must not default to zero
  conductScore?: number;
  qualification: QualificationStatus;
  // Human-readable name of the criterion that broke a tie to determine this position
  tiebreakerUsed?: string;
  // True when all group matches are finished but a tiebreaker cannot be resolved
  // by any available criterion. While the group is still in progress, positions
  // are projected (not provisional) — that distinction is handled at the bracket layer.
  provisional: boolean;
}

export interface GroupStandings {
  groupId: GroupId;
  // Ordered by position ascending (1st place first)
  rows: StandingRow[];
  // True when every match in the group has a finished status
  complete: boolean;
}

export interface ThirdPlaceRankingRow {
  // Position across all 12 groups' third-place teams (1–12); lower is better
  rank: number;
  // The group where this team finished 3rd
  groupId: GroupId;
  teamId: string;
  played: number;
  goalDifference: number;
  goalsFor: number;
  // undefined means conduct data is unavailable; display as "—" in UI
  conductScore?: number;
  points: number;
  // null means an unresolved tied set spans the qualification boundary
  qualifying: boolean | null;
  // True when the underlying group standings position is provisional (unresolvable
  // tiebreaker after all group matches finish), or when this rank itself cannot be
  // resolved by any available criterion.
  provisional: boolean;
  // Human-readable name of the criterion that determined this rank
  tiebreakerUsed?: string;
}

export interface ThirdPlaceRankingDiagnostic {
  // Teams involved in the tie that could not be resolved
  teamIds: string[];
  // The tiebreaker criterion that failed to separate the teams
  criterion: string;
  // True when the tie straddles the 8-team qualification boundary (position 8 vs 9)
  affectsQualification: boolean;
}

export interface ThirdPlaceRanking {
  rows: ThirdPlaceRankingRow[];
  // Best 8 of 12 third-place teams advance; literal constant
  qualificationBoundary: 8;
  // False when a tie at position 8/9 cannot be broken by any available criterion
  boundaryResolved: boolean;
  diagnostics: ThirdPlaceRankingDiagnostic[];
}
