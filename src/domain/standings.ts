import type { GroupId } from "./common";

export type QualificationStatus = "DIRECT" | "THIRD_PLACE_QUALIFIER" | "OUTSIDE" | "UNRESOLVED";

export interface StandingRow {
  teamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  // undefined means data unavailable; must not default to zero
  conductScore?: number;
  qualification: QualificationStatus;
  tiebreakerUsed?: string;
  provisional: boolean;
}

export interface GroupStandings {
  groupId: GroupId;
  rows: StandingRow[];
}

export interface ThirdPlaceRankingRow {
  rank: number;
  groupId: GroupId;
  teamId: string;
  played: number;
  goalDifference: number;
  goalsFor: number;
  // undefined means conduct data is unavailable; display as "—" in UI
  conductScore?: number;
  points: number;
  qualifying: boolean;
  provisional: boolean;
  tiebreakerUsed?: string;
}
