import type { GroupId, NormalizedMatchStatus, TournamentRound } from "./common";

// null means no score exists (scheduled/unknown); 0 is a real zero score
export interface MatchScore {
  home: number | null;
  away: number | null;
}

export interface MatchClock {
  elapsedSeconds?: number;
  displayValue?: string;
  period?: number;
}

export type CardType =
  | "YELLOW"
  | "RED_INDIRECT"   // second yellow
  | "RED_DIRECT"
  | "YELLOW_PLUS_DIRECT_RED";

export interface DisciplinaryEvent {
  teamId: string;
  playerId?: string;
  playerName?: string;
  cardType: CardType;
  minute?: number;
}

export type DisciplinaryCoverage = "COMPLETE" | "INCOMPLETE" | "UNAVAILABLE";

export interface Match {
  id: string;
  matchNumber: number;
  round: TournamentRound;
  group?: GroupId;
  kickoffUtc: string;
  venue?: string;
  city?: string;
  status: NormalizedMatchStatus;
  clock?: MatchClock;
  // Retained for existing consumers while structured clock support is adopted.
  elapsedMinutes?: number;
  homeTeamId?: string;
  awayTeamId?: string;
  // Penalties never contribute to normalTime; each is tracked separately
  normalTime?: MatchScore;
  extraTime?: MatchScore;
  penalties?: MatchScore;
  winnerTeamId?: string;
  disciplinaryEvents?: DisciplinaryEvent[];
  disciplinaryCoverage?: DisciplinaryCoverage;
  updatedAt?: string;
}
