import type { GroupId, NormalizedMatchStatus, TournamentRound } from "./common";

// null means no score exists (scheduled/unknown); 0 is a real zero score
export interface MatchScore {
  home: number | null;
  away: number | null;
}

export interface MatchClock {
  // Total seconds elapsed within the current period
  elapsedSeconds?: number;
  // Raw display string from source, e.g. "45'+2'" for stoppage time
  displayValue?: string;
  // 1 = first half, 2 = second half, 3 = first ET half, 4 = second ET half
  period?: number;
}

export type CardType =
  | "YELLOW"
  | "RED_INDIRECT"              // second yellow resulting in a red
  | "RED_DIRECT"
  | "YELLOW_PLUS_DIRECT_RED";   // simultaneous yellow and direct red

export interface DisciplinaryEvent {
  // Team the card was issued against
  teamId: string;
  // Source-system player ID; absent for team-level cards
  playerId?: string;
  // Display name as reported by the source
  playerName?: string;
  cardType: CardType;
  // Match minute when the card was issued; absent if not reported
  minute?: number;
}

export type DisciplinaryCoverage =
  | "COMPLETE"     // all card events confirmed present
  | "INCOMPLETE"   // some events may be missing
  | "UNAVAILABLE"; // source provides no disciplinary data for this match

export type MatchEventType =
  | "GOAL"
  | "OWN_GOAL"
  | "PENALTY_GOAL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "YELLOW_RED_CARD";

export interface MatchEvent {
  id?: string;
  type: MatchEventType;
  clockSeconds?: number;
  clockDisplay?: string;
  teamId?: string;
  primaryPlayerName?: string;
  scoreValue?: number;
}

export interface Match {
  // Source-system identifier; not sequential
  id: string;
  // Sequential 1–104 across the whole tournament
  matchNumber: number;
  round: TournamentRound;
  // Only set for GROUP_STAGE matches
  group?: GroupId;
  // ISO 8601 scheduled kick-off time in UTC
  kickoffUtc: string;
  // Stadium name
  venue?: string;
  city?: string;
  status: NormalizedMatchStatus;
  // Live clock; only present during in-progress matches
  clock?: MatchClock;
  // Retained for existing consumers while structured clock support is adopted.
  elapsedMinutes?: number;
  // Undefined for knockout slots whose teams are not yet determined
  homeTeamId?: string;
  awayTeamId?: string;
  // Penalties never contribute to normalTime; each is tracked separately
  normalTime?: MatchScore;
  extraTime?: MatchScore;
  penalties?: MatchScore;
  // Only set after the match is finished
  winnerTeamId?: string;
  disciplinaryEvents?: DisciplinaryEvent[];
  // Reliability indicator for disciplinaryEvents; absent if coverage is unknown
  disciplinaryCoverage?: DisciplinaryCoverage;
  // Goals, cards, and other notable in-match events from the source
  events?: MatchEvent[];
  // ISO 8601 timestamp from upstream source; absent if not reported
  updatedAt?: string;
}
