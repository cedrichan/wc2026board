import type { GroupId, TournamentRound } from "./common";

export type SlotSource =
  | { type: "GROUP_WINNER"; group: GroupId }
  | { type: "GROUP_RUNNER_UP"; group: GroupId }
  | { type: "THIRD_PLACE"; groups: string }  // e.g. "A/B/C/D/F"
  | { type: "MATCH_WINNER"; matchNumber: number };

// Participant slot state for a bracket entry
export type ParticipantSlotState = "PLACEHOLDER" | "PROJECTED" | "CONFIRMED" | "SUPERSEDED";

export interface ParticipantSlot {
  state: ParticipantSlotState;
  // Set when a team is identified (PROJECTED, CONFIRMED, or SUPERSEDED)
  teamId?: string;
  // Human-readable label for PLACEHOLDER slots, e.g. "Winner M73", "1E", "3A/B/C/D/F"
  label?: string;
  // Set for PROJECTED slots, e.g. "Projected winner of Group E"
  qualificationSource?: string;
}

export interface BracketMatchDefinition {
  matchNumber: number;
  round: Exclude<TournamentRound, "GROUP_STAGE">;
  homeSource: SlotSource;
  awaySource: SlotSource;
  // Match number that the winner feeds into
  winnerFeedsMatch?: number;
  winnerFeedsSide?: "HOME" | "AWAY";
}
